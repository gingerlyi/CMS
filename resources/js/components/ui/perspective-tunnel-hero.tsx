// Adapted from the 21st.dev "perspective tunnel hero": driven by page scroll (a sticky stage inside a tall section)
// instead of hijacking the mouse wheel, so the page can still be scrolled past it. Brand colours, photos from props.
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

export type TunnelImage = { src: string; title: string };

type Card = { item: TunnelImage; cos: number; sin: number; rx: number; ry: number; rotate: number; index: number };
type Stage = { width: number; height: number; isMobile: boolean };

// Fewer photos than this are repeated, otherwise the tunnel looks empty.
const MIN_CARDS = 9;
const SPRING = { stiffness: 60, damping: 25, mass: 0.5 };

function buildCards(images: TunnelImage[]): Card[] {
    const items = Array.from({ length: Math.max(MIN_CARDS, images.length) }, (_, i) => images[i % images.length]);
    return items.map((item, i) => {
        const angle = i * 137.5 * (Math.PI / 180); // golden angle spreads the cards around the centre
        return {
            item,
            cos: Math.cos(angle),
            sin: Math.sin(angle),
            rx: 0.28 + (i % 3) * 0.08,
            ry: 0.26 + (i % 2) * 0.09,
            rotate: (i % 2 === 0 ? 1 : -1) * (3 + (i % 5) * 2),
            index: i,
        };
    });
}

const readStage = (): Stage => ({ width: window.innerWidth, height: window.innerHeight, isMobile: window.innerWidth < 768 });

function useStage() {
    const [stage, setStage] = useState(readStage);
    useEffect(() => {
        const onResize = () => setStage(readStage());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    return stage;
}

function useCameraParallax(enabled: boolean) {
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const x = useSpring(rawX, SPRING);
    const y = useSpring(rawY, SPRING);

    useEffect(() => {
        if (!enabled) return;
        const onMove = (e: PointerEvent) => {
            rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
            rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        return () => window.removeEventListener('pointermove', onMove);
    }, [enabled, rawX, rawY]);

    return { x, y };
}

function TunnelCard({
    card,
    progress,
    pointer,
    total,
    stage,
}: {
    card: Card;
    progress: MotionValue<number>;
    pointer: { x: MotionValue<number>; y: MotionValue<number> };
    total: number;
    stage: Stage;
}) {
    const span = 0.55;
    const start = (card.index / total) * (1 - span);
    const local = useTransform(progress, [start, start + span], [0, 1]);
    const z = useTransform(local, [0, 1], stage.isMobile ? [-1200, 350] : [-1700, 500]);
    const opacity = useTransform(local, [0, 0.18, 0.82, 0.98], [0, 1, 1, 0]);

    const width = stage.isMobile ? Math.max(130, Math.min(180, stage.width * 0.38)) : Math.max(180, Math.min(270, stage.width * 0.18));
    const baseX = card.cos * stage.width * card.rx;
    const baseY = card.sin * stage.height * card.ry;
    const pan = stage.isMobile ? 20 : 45;

    const transform = useTransform(
        [z, pointer.x, pointer.y],
        ([zz, px, py]: number[]) =>
            `translate3d(calc(-50% + ${baseX - px * pan}px), calc(-50% + ${baseY - py * pan}px), ${zz}px) rotateZ(${card.rotate}deg)`,
    );

    return (
        <motion.div
            style={{ width, transform, opacity, zIndex: card.index + 1 }}
            className="pointer-events-auto absolute top-1/2 left-1/2 aspect-[4/5] select-none will-change-transform"
        >
            <div className="group hover:ring-brand/70 hover:shadow-brand/25 relative size-full overflow-hidden rounded-2xl bg-neutral-200 shadow-2xl ring-1 shadow-neutral-950/20 ring-black/10 transition-all duration-500">
                <img
                    src={card.item.src}
                    alt={card.item.title}
                    draggable={false}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-black/10 to-transparent p-4 sm:p-5">
                    <span className="font-mono text-xs tracking-widest text-white/95 uppercase drop-shadow-md sm:text-sm">{card.item.title}</span>
                </div>
            </div>
        </motion.div>
    );
}

export function PerspectiveTunnel({ images, label, title, text, id }: { images: TunnelImage[]; label?: string; title: string; text?: string; id?: string }) {
    const ref = useRef<HTMLElement>(null);
    const reduce = useReducedMotion();
    const stage = useStage();
    const cards = useMemo(() => buildCards(images), [images]);

    // 0 when the section's top hits the top of the screen, 1 when its bottom reaches the bottom.
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
    const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 30, restDelta: 0.0001 });
    const pointer = useCameraParallax(!reduce);

    const titleScale = useTransform(progress, [0, 0.5, 1], [0.7, 1, 1.35]);
    const titleOpacity = useTransform(progress, [0, 0.12, 0.85, 1], [0.25, 1, 1, 0]);
    const promptOpacity = useTransform(progress, [0, 0.12], [1, 0]);

    return (
        <section ref={ref} id={id} className="relative h-[300vh] bg-neutral-50 text-neutral-900">
            <div
                className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden select-none"
                style={{ perspective: stage.isMobile ? '900px' : '1200px', transformStyle: 'preserve-3d' }}
            >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)] [background-size:28px_28px] opacity-70" />
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{ background: 'radial-gradient(circle at center, color-mix(in srgb, var(--brand) 15%, transparent) 0%, transparent 70%)' }}
                />
                <div className="border-brand/15 pointer-events-none absolute size-[48vmin] rounded-full border" />
                <div className="pointer-events-none absolute size-[76vmin] rounded-full border border-dashed border-neutral-300/60" />

                <motion.div style={{ scale: titleScale, opacity: titleOpacity }} className="pointer-events-none z-0 flex max-w-2xl flex-col items-center px-6 text-center">
                    {label && <p className="text-brand mb-4 font-mono text-xs tracking-[0.4em] uppercase">{label}</p>}
                    <h2 className="from-brand-2 via-brand-2 to-brand bg-gradient-to-b bg-clip-text text-4xl leading-[0.95] font-extrabold tracking-tighter text-balance text-transparent sm:text-6xl md:text-7xl">
                        {title}
                    </h2>
                    {text && <p className="mt-4 max-w-[40ch] text-sm text-neutral-600 sm:text-base">{text}</p>}
                </motion.div>

                <motion.div
                    style={{ opacity: promptOpacity }}
                    className="pointer-events-none absolute bottom-8 z-20 flex flex-col items-center gap-2 font-mono text-xs tracking-[0.3em] text-neutral-500 uppercase"
                >
                    <span>Gulir untuk menjelajah</span>
                    <div className="from-brand h-6 w-px bg-gradient-to-b to-transparent" />
                </motion.div>

                <div className="pointer-events-none absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
                    {cards.map((card) => (
                        <TunnelCard key={card.index} card={card} progress={progress} pointer={pointer} total={cards.length} stage={stage} />
                    ))}
                </div>
            </div>
        </section>
    );
}
