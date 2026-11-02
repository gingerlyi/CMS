import { geoGraticule10, geoOrthographic, geoPath, type GeoPermissibleObjects } from 'd3-geo';
import { gsap } from 'gsap';
import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';

export type GlobeHandle = {
    /** Zoom by a factor (e.g. 1.5 in, 1 / 1.5 out). */
    zoomBy: (factor: number) => void;
};

interface DottedGlobeProps {
    lat: number;
    lng: number;
    label?: string;
    /** When true the globe flies to the marker and zooms in; false zooms back out. */
    focused?: boolean;
    onMarkerClick?: () => void;
    /** Called once the fly-in finishes, to reveal whatever comes next. */
    onFocusComplete?: () => void;
    className?: string;
    ref?: Ref<GlobeHandle>;
}

const MIN_ZOOM = 0.8;
const MAX_ZOOM = 8;
const FOCUS_ZOOM = 7;
const toRad = Math.PI / 180;

export function DottedGlobe({ lat, lng, label, focused = false, onMarkerClick, onFocusComplete, className = '', ref }: DottedGlobeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // Mutable view state shared by the render loop, pointer handlers and GSAP tweens.
    const view = useRef({ lambda: -lng + 40, phi: -lat * 0.5 - 10, zoom: 1, pulse: 0, idleUntil: 0, focused, marker: [0, 0, false] as [number, number, boolean] });
    const callbacks = useRef({ onMarkerClick, onFocusComplete });
    callbacks.current = { onMarkerClick, onFocusComplete };

    useImperativeHandle(ref, () => ({
        zoomBy: (factor) => {
            view.current.idleUntil = performance.now() + 3000;
            gsap.to(view.current, { zoom: gsap.utils.clamp(MIN_ZOOM, MAX_ZOOM, view.current.zoom * factor), duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
        },
    }));

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const v = view.current;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const projection = geoOrthographic().clipAngle(90).precision(0.5);
        const path = geoPath(projection, ctx);
        const graticule = geoGraticule10();
        let land: GeoPermissibleObjects | null = null;
        // Land dots as unit vectors, so the visible-hemisphere test is a cheap dot product.
        let dots = new Float32Array(0);
        let width = 0;
        let height = 0;
        let dpr = 1;
        let brand = '#9b111e';
        let cancelled = false;
        let dragging = false;
        let start = { x: 0, y: 0, lambda: 0, phi: 0, moved: 0 };

        Promise.all([fetch('/data/land.json').then((r) => r.json()), fetch('/data/land-dots.json').then((r) => r.json())]).then(([outline, flat]: [GeoPermissibleObjects, number[]]) => {
            if (cancelled) return;
            land = outline;
            dots = new Float32Array((flat.length / 2) * 5);
            for (let i = 0, j = 0; i < flat.length; i += 2, j += 5) {
                const lon = flat[i] * toRad;
                const la = flat[i + 1] * toRad;
                dots.set([flat[i], flat[i + 1], Math.cos(la) * Math.cos(lon), Math.cos(la) * Math.sin(lon), Math.sin(la)], j);
            }
        });

        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            brand = getComputedStyle(canvas).getPropertyValue('--brand').trim() || brand;
        };
        const observer = new ResizeObserver(resize);
        observer.observe(canvas);
        resize();

        const render = () => {
            const radius = (Math.min(width, height) / 2) * 0.88 * v.zoom;
            projection.translate([width / 2, height / 2]).scale(radius).rotate([v.lambda, v.phi]);

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, width, height);

            // Sphere with a faint brand glow
            const glow = ctx.createRadialGradient(width / 2, height / 2, radius * 0.2, width / 2, height / 2, radius * 1.15);
            glow.addColorStop(0, 'rgba(255,255,255,0.03)');
            glow.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.beginPath();
            path({ type: 'Sphere' });
            ctx.fillStyle = glow;
            ctx.fill();

            ctx.beginPath();
            path(graticule);
            ctx.strokeStyle = 'rgba(255,255,255,0.14)';
            ctx.lineWidth = 0.6;
            ctx.stroke();

            if (land) {
                ctx.beginPath();
                path(land);
                ctx.strokeStyle = 'rgba(255,255,255,0.75)';
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }

            // Centre of the visible hemisphere as a unit vector
            const cLon = -v.lambda * toRad;
            const cLat = -v.phi * toRad;
            const cx = Math.cos(cLat) * Math.cos(cLon);
            const cy = Math.cos(cLat) * Math.sin(cLon);
            const cz = Math.sin(cLat);
            const size = Math.max(1, Math.min(3, radius / 170));
            ctx.fillStyle = 'rgba(255,255,255,0.72)';
            for (let j = 0; j < dots.length; j += 5) {
                const facing = dots[j + 2] * cx + dots[j + 3] * cy + dots[j + 4] * cz;
                if (facing < 0.05) continue;
                const p = projection([dots[j], dots[j + 1]]);
                if (!p || p[0] < -4 || p[1] < -4 || p[0] > width + 4 || p[1] > height + 4) continue;
                ctx.globalAlpha = 0.35 + facing * 0.65;
                ctx.fillRect(p[0] - size / 2, p[1] - size / 2, size, size);
            }
            ctx.globalAlpha = 1;

            ctx.beginPath();
            path({ type: 'Sphere' });
            ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Marker
            const la = lat * toRad;
            const lo = lng * toRad;
            const visible = Math.cos(la) * Math.cos(lo) * cx + Math.cos(la) * Math.sin(lo) * cy + Math.sin(la) * cz > 0;
            const m = projection([lng, lat]);
            v.marker = [m?.[0] ?? 0, m?.[1] ?? 0, visible && !!m];
            if (visible && m) {
                for (const offset of [0, 0.5]) {
                    const t = (v.pulse + offset) % 1;
                    ctx.beginPath();
                    ctx.arc(m[0], m[1], 6 + t * 26, 0, Math.PI * 2);
                    ctx.strokeStyle = brand;
                    ctx.globalAlpha = 1 - t;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                ctx.globalAlpha = 1;
                ctx.beginPath();
                ctx.arc(m[0], m[1], 6, 0, Math.PI * 2);
                ctx.fillStyle = brand;
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#fff';
                ctx.stroke();

                if (label && !v.focused) {
                    ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
                    const w = ctx.measureText(label).width + 16;
                    // Keep the pill inside the circular mask even when the marker sits near the rim.
                    const x = gsap.utils.clamp(width * 0.12, width * 0.88 - w, m[0] - w / 2);
                    ctx.fillStyle = 'rgba(0,0,0,0.75)';
                    ctx.beginPath();
                    ctx.roundRect(x, m[1] - 40, w, 24, 12);
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    ctx.fillStyle = '#fff';
                    ctx.textAlign = 'center';
                    ctx.fillText(label, x + w / 2, m[1] - 24);
                }
            }
        };

        const tick = (time: number) => {
            v.pulse = (time % 1.6) / 1.6;
            // Idle: sway gently around the marker so it stays on the visible side (and drift back there after a drag).
            if (!reduceMotion && !v.focused && !dragging && performance.now() > v.idleUntil) {
                v.lambda += (-lng + Math.sin(time / 4) * 35 - v.lambda) * 0.02;
            }
            render();
        };
        gsap.ticker.add(tick);

        // Drag to rotate; a click (barely moved) on the marker selects it.
        const nearMarker = (e: PointerEvent) => {
            const r = canvas.getBoundingClientRect();
            const [mx, my, visible] = v.marker;
            return visible && Math.hypot(e.clientX - r.left - mx, e.clientY - r.top - my) < 22;
        };
        const onDown = (e: PointerEvent) => {
            if (v.focused) return;
            dragging = true;
            start = { x: e.clientX, y: e.clientY, lambda: v.lambda, phi: v.phi, moved: 0 };
            canvas.setPointerCapture(e.pointerId);
            gsap.killTweensOf(v, 'lambda,phi');
        };
        const onMove = (e: PointerEvent) => {
            if (!dragging) {
                canvas.style.cursor = v.focused ? 'default' : nearMarker(e) ? 'pointer' : 'grab';
                return;
            }
            const k = 0.25 / v.zoom;
            start.moved = Math.max(start.moved, Math.hypot(e.clientX - start.x, e.clientY - start.y));
            v.lambda = start.lambda + (e.clientX - start.x) * k;
            v.phi = gsap.utils.clamp(-85, 85, start.phi - (e.clientY - start.y) * k);
            canvas.style.cursor = 'grabbing';
        };
        const onUp = (e: PointerEvent) => {
            if (!dragging) return;
            dragging = false;
            v.idleUntil = performance.now() + 2500;
            canvas.style.cursor = 'grab';
            if (start.moved < 5 && nearMarker(e)) callbacks.current.onMarkerClick?.();
        };
        canvas.addEventListener('pointerdown', onDown);
        canvas.addEventListener('pointermove', onMove);
        canvas.addEventListener('pointerup', onUp);
        canvas.addEventListener('pointercancel', onUp);

        return () => {
            cancelled = true;
            observer.disconnect();
            gsap.ticker.remove(tick);
            gsap.killTweensOf(v);
            canvas.removeEventListener('pointerdown', onDown);
            canvas.removeEventListener('pointermove', onMove);
            canvas.removeEventListener('pointerup', onUp);
            canvas.removeEventListener('pointercancel', onUp);
        };
    }, [lat, lng, label]);

    // Fly to the marker (rotate + zoom in) or back out to the whole globe.
    useEffect(() => {
        const v = view.current;
        v.focused = focused;
        if (focused) {
            // Take the short way round so the globe never spins more than half a turn.
            const target = -lng;
            const lambda = v.lambda + ((((target - v.lambda) % 360) + 540) % 360) - 180;
            gsap.to(v, {
                lambda,
                phi: -lat,
                zoom: FOCUS_ZOOM,
                duration: 2,
                ease: 'power3.inOut',
                overwrite: 'auto',
                onComplete: () => callbacks.current.onFocusComplete?.(),
            });
        } else {
            gsap.to(v, { zoom: 1, phi: -lat * 0.5 - 10, duration: 1.6, ease: 'power3.inOut', overwrite: 'auto', onComplete: () => (v.idleUntil = 0) });
        }
    }, [focused, lat, lng]);

    // Circular mask: the whole globe fits inside it, and when zoomed in the edges fade like a lens instead of a hard box.
    return (
        <canvas
            ref={canvasRef}
            className={`touch-pan-y select-none ${className}`}
            style={{ cursor: 'grab', maskImage: 'radial-gradient(closest-side, black 90%, transparent 100%)' }}
        />
    );
}

export default DottedGlobe;
