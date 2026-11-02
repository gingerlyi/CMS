import { gsap } from 'gsap';
import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';

export type CrowdHandle = {
    /** Stop every peep and turn it toward viewport clientX; null lets them walk again. */
    face: (clientX: number | null) => void;
    /** Make the stopped peeps jump together. */
    jump: () => void;
};

interface CrowdCanvasProps {
    src: string;
    rows?: number;
    cols?: number;
    className?: string;
    ref?: Ref<CrowdHandle>;
}

type Peep = {
    image: HTMLImageElement;
    rect: number[];
    width: number;
    height: number;
    x: number;
    y: number;
    anchorY: number;
    scaleX: number;
    /** Forward lean in radians, pivoting at the feet. */
    lean: number;
    walk: gsap.core.Timeline;
    render: (ctx: CanvasRenderingContext2D) => void;
};

const randomRange = (min: number, max: number) => min + Math.random() * (max - min);
const randomIndex = (array: unknown[]) => randomRange(0, array.length) | 0;
const removeFromArray = <T,>(array: T[], i: number) => array.splice(i, 1)[0];

const CrowdCanvas = ({ src, rows = 15, cols = 7, className = 'absolute bottom-0 h-[90vh] w-full', ref }: CrowdCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const api = useRef<CrowdHandle>({ face: () => {}, jump: () => {} });
    useImperativeHandle(ref, () => ({ face: (x) => api.current.face(x), jump: () => api.current.jump() }), []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const img = document.createElement('img');
        const stage = { width: 0, height: 0, scale: 1 };
        const allPeeps: Peep[] = [];
        const availablePeeps: Peep[] = [];
        const crowd: Peep[] = [];
        // Peeps currently stopped to look at the cursor, with the state to restore when they walk again.
        const frozen = new Map<Peep, { x: number; scaleX: number; hop: gsap.core.Tween }>();

        const createPeep = (rect: number[]): Peep => {
            const peep = {
                image: img,
                rect,
                width: rect[2],
                height: rect[3],
                x: 0,
                y: 0,
                anchorY: 0,
                scaleX: 1,
                lean: 0,
                walk: gsap.timeline(),
                render: (ctx: CanvasRenderingContext2D) => {
                    ctx.save();
                    ctx.translate(peep.x, peep.y);
                    ctx.scale(peep.scaleX, 1);
                    if (peep.lean) {
                        ctx.translate(peep.width / 2, peep.height);
                        ctx.rotate(peep.lean);
                        ctx.translate(-peep.width / 2, -peep.height);
                    }
                    ctx.drawImage(img, rect[0], rect[1], rect[2], rect[3], 0, 0, peep.width, peep.height);
                    ctx.restore();
                },
            };
            return peep;
        };

        const resetPeep = (peep: Peep) => {
            const direction = Math.random() > 0.5 ? 1 : -1;
            const offsetY = 100 - 250 * gsap.parseEase('power2.in')(Math.random());
            const startY = stage.height - peep.height + offsetY;
            const startX = direction === 1 ? -peep.width : stage.width + peep.width;
            const endX = direction === 1 ? stage.width : 0;

            peep.scaleX = direction;
            peep.x = startX;
            peep.y = startY;
            peep.anchorY = startY;

            return { startY, endX };
        };

        const walk = (peep: Peep, { startY, endX }: { startY: number; endX: number }) => {
            const xDuration = 10;
            const yDuration = 0.25;
            const tl = gsap.timeline();
            tl.timeScale(randomRange(0.5, 1.5));
            tl.to(peep, { duration: xDuration, x: endX, ease: 'none' }, 0);
            tl.to(peep, { duration: yDuration, repeat: xDuration / yDuration, yoyo: true, y: startY - 10 }, 0);
            return tl;
        };

        const addPeepToCrowd = (): Peep => {
            const peep = removeFromArray(availablePeeps, randomIndex(availablePeeps));
            peep.walk = walk(peep, resetPeep(peep)).eventCallback('onComplete', () => {
                removeFromArray(crowd, crowd.indexOf(peep));
                availablePeeps.push(peep);
                addPeepToCrowd();
            });
            crowd.push(peep);
            crowd.sort((a, b) => a.anchorY - b.anchorY);
            return peep;
        };

        // Stop every peep and turn it toward clientX; null releases them back to their walk.
        const face = (clientX: number | null) => {
            if (clientX === null) {
                frozen.forEach((s, peep) => {
                    s.hop.kill();
                    gsap.to(peep, { lean: 0, duration: 0.3, overwrite: 'auto' });
                    peep.x = s.x;
                    peep.scaleX = s.scaleX;
                    if (!reduceMotion) peep.walk.resume();
                });
                frozen.clear();
                return;
            }

            const targetX = (clientX - canvas.getBoundingClientRect().left) / stage.scale;
            crowd.forEach((peep) => {
                let s = frozen.get(peep);
                if (!s) {
                    peep.walk.pause();
                    const hop = gsap.fromTo(peep, { y: peep.anchorY }, { y: peep.anchorY - 18, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out', delay: Math.random() * 0.15 });
                    // Lean forward (the way the peep faces), so turning toward the target reads clearly.
                    gsap.to(peep, { lean: randomRange(0.1, 0.18), duration: 0.4, ease: 'back.out(3)', overwrite: 'auto' });
                    s = { x: peep.x, scaleX: peep.scaleX, hop };
                    frozen.set(peep, s);
                }
                // scaleX -1 draws to the left of x, so flip around the peep's visual left edge to keep it in place.
                const left = s.scaleX === 1 ? s.x : s.x - peep.width;
                peep.scaleX = left + peep.width / 2 < targetX ? 1 : -1;
                peep.x = peep.scaleX === 1 ? left : left + peep.width;
            });
        };
        const jump = () => {
            frozen.forEach((s, peep) => {
                s.hop.kill();
                s.hop = gsap.fromTo(
                    peep,
                    { y: peep.anchorY },
                    { y: peep.anchorY - randomRange(30, 55), duration: 0.22, yoyo: true, repeat: 1, ease: 'power2.out', delay: Math.random() * 0.2 },
                );
            });
        };
        api.current = { face, jump };

        // 3x phone screens gain nothing visible over 2x here, but cost over twice the pixels on every frame.
        const dpr = Math.min(devicePixelRatio, 2);

        // No drawing while scrolled out of view.
        let visible = true;
        const visibility = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
        visibility.observe(canvas);

        const render = () => {
            if (!visible) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.scale(dpr * stage.scale, dpr * stage.scale);
            crowd.forEach((peep) => peep.render(ctx));
            ctx.restore();
        };

        const resize = () => {
            // Phones fire resize when the address bar slides away; rebuilding then would make the crowd jump mid-scroll.
            const width = Math.floor(canvas.clientWidth * dpr);
            const height = Math.floor(canvas.clientHeight * dpr);
            if (crowd.length && width === canvas.width && height === canvas.height) return;

            // Fit the crowd to the canvas: the back row stands up to 150 above the floor, plus ~30 for bob/hop.
            // Narrow screens keep the people at a readable size and show fewer of them instead of shrinking everyone.
            const zone = (allPeeps[0]?.height ?? 0) + 180;
            stage.scale = Math.max(0.35, Math.min(1, Math.max(canvas.clientWidth / 1300, 0.6), canvas.clientHeight / zone));
            stage.width = canvas.clientWidth / stage.scale;
            stage.height = canvas.clientHeight / stage.scale;
            canvas.width = width;
            canvas.height = height;

            frozen.clear();
            crowd.forEach((peep) => peep.walk.kill());
            crowd.length = 0;
            availablePeeps.length = 0;
            availablePeeps.push(...allPeeps);

            while (availablePeeps.length) {
                const peep = addPeepToCrowd();
                peep.walk.progress(Math.random());
                if (reduceMotion) peep.walk.pause();
            }
        };

        img.onload = () => {
            const w = img.naturalWidth / rows;
            const h = img.naturalHeight / cols;
            for (let i = 0; i < rows * cols; i++) {
                allPeeps.push(createPeep([(i % rows) * w, ((i / rows) | 0) * h, w, h]));
            }
            resize();
            gsap.ticker.add(render);
        };
        img.src = src;

        window.addEventListener('resize', resize);

        return () => {
            img.onload = null;
            visibility.disconnect();
            window.removeEventListener('resize', resize);
            gsap.ticker.remove(render);
            frozen.forEach((s) => s.hop.kill());
            crowd.forEach((peep) => peep.walk.kill());
        };
    }, [src, rows, cols]);

    return <canvas ref={canvasRef} className={className} />;
};

const Skiper39 = () => {
    return (
        <div className="relative h-full w-full bg-white text-black">
            <div className="absolute top-22 left-1/2 grid -translate-x-1/2 content-start justify-items-center gap-6 text-center text-black">
                <span className="relative max-w-[12ch] text-xs leading-tight uppercase opacity-40 after:absolute after:top-full after:left-1/2 after:h-16 after:w-px after:bg-gradient-to-b after:from-white after:to-black after:content-['']">
                    Croud Canvas
                </span>
            </div>
            <div className="absolute bottom-0 h-full w-screen">
                <CrowdCanvas src="/images/peeps.png" rows={15} cols={7} />
            </div>
        </div>
    );
};

export { CrowdCanvas, Skiper39 };
export default Skiper39;

/**
 * Skiper 39 Canvas_Landing_004 — React + Canvas
 * Inspired by and adapted from https://codepen.io/zadvorsky/pen/xxwbBQV
 * illustration by https://www.openpeeps.com/
 * Attribution to Skiper UI is required when using the free version.
 * Author: @gurvinder-singh02 — https://gxuri.me
 */
