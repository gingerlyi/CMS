import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode, type TouchEvent } from 'react';

export interface CarouselItem {
    tag?: string | null;
    titleLine1: string;
    titleLine2?: string | null;
    desc?: string | null;
    img?: string | null;
    /** Shown on a brand gradient when there is no photo. */
    icon?: ReactNode;
    ctaText?: string;
    ctaUrl?: string;
}

export interface CoverFlowCarouselProps {
    items: CarouselItem[];
    sectionLabel?: string;
    title?: string;
    autoplay?: boolean;
    autoplayDelay?: number;
    className?: string;
    id?: string;
    onCtaClick?: (item: CarouselItem) => void;
}

// Position of each card relative to the centre one: [translateX px, scale, rotateY deg, opacity, zIndex, filter]
const slots: Record<string, [number, number, number, number, number, string]> = {
    '0': [0, 1, 0, 1, 30, 'brightness(1)'],
    '1': [285, 0.84, -24, 0.65, 20, 'brightness(0.75)'],
    '2': [510, 0.68, -38, 0.38, 10, 'brightness(0.55) blur(1px)'],
    '-1': [-285, 0.84, 24, 0.65, 20, 'brightness(0.75)'],
    '-2': [-510, 0.68, 38, 0.38, 10, 'brightness(0.55) blur(1px)'],
};
const hidden: [number, number, number, number, number, string] = [0, 0.4, 0, 0, 0, 'brightness(0.4) blur(2px)'];

export function CoverFlowCarousel({
    items,
    sectionLabel,
    title,
    autoplay = true,
    autoplayDelay = 5000,
    className = '',
    id,
    onCtaClick,
}: CoverFlowCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    // Shrinks the card spread on narrow screens so side cards still peek in.
    const [spread, setSpread] = useState(1);
    const touchStartX = useRef(0);
    const total = items.length;

    const nextSlide = useCallback(() => setCurrentIndex((prev) => (prev + 1) % total), [total]);
    const prevSlide = useCallback(() => setCurrentIndex((prev) => (prev - 1 + total) % total), [total]);

    useEffect(() => {
        const onResize = () => setSpread(Math.min(1, window.innerWidth / 1100));
        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        if (!autoplay || isHovered || total <= 1) return;
        const interval = setInterval(nextSlide, autoplayDelay);
        return () => clearInterval(interval);
    }, [autoplay, autoplayDelay, isHovered, nextSlide, total]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't hijack arrow keys while the visitor is typing in a form.
            if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable]')) return;
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nextSlide, prevSlide]);

    const handleTouchEnd = (e: TouchEvent) => {
        const diff = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(diff) > 45) {
            if (diff < 0) nextSlide();
            else prevSlide();
        }
    };

    if (total === 0) return null;
    const current = items[currentIndex];

    return (
        <section
            id={id}
            className={`relative flex min-h-[760px] w-full items-center justify-center overflow-hidden bg-neutral-950 py-16 text-white select-none ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
            onTouchEnd={handleTouchEnd}
        >
            {/* Background ambience: blurred current photo, or a brand glow */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                {current.img ? (
                    <img src={current.img} alt="" className="size-full scale-115 object-cover blur-[32px] brightness-[0.22] transition duration-1000" />
                ) : (
                    <div className="bg-brand/30 absolute top-1/2 left-1/2 size-[40rem] -translate-1/2 rounded-full blur-3xl" />
                )}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(10,10,10,0.3)_0%,rgba(10,10,10,0.92)_100%)]" />
            </div>

            <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-4">
                {sectionLabel && (
                    <div data-reveal className="mb-3 flex items-center gap-3">
                        <span className="to-brand h-px w-9 bg-gradient-to-r from-transparent" />
                        <h3 className="text-brand text-xs font-bold tracking-[0.3em] uppercase brightness-150">{sectionLabel}</h3>
                        <span className="from-brand h-px w-9 bg-gradient-to-r to-transparent" />
                    </div>
                )}
                {title && <h2 data-reveal className="mb-8 text-center text-3xl font-extrabold tracking-tight sm:text-5xl">{title}</h2>}

                {/* 3D coverflow stage */}
                <div data-reveal="zoom" className="relative mb-8 flex h-[520px] w-full items-center justify-center [perspective:1400px]">
                    {items.map((item, idx) => {
                        let offset = (idx - currentIndex + total) % total;
                        if (offset > total / 2) offset -= total;
                        const [x, scale, rotate, opacity, zIndex, filter] = slots[offset] ?? hidden;
                        const isCenter = offset === 0;

                        return (
                            <div
                                key={idx}
                                onClick={() => !isCenter && setCurrentIndex(idx)}
                                className={`absolute h-[500px] w-[min(330px,80vw)] overflow-hidden rounded-[18px] border border-white/12 bg-neutral-900 transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${isCenter ? '[box-shadow:0_25px_60px_rgba(0,0,0,0.9),0_0_35px_color-mix(in_srgb,var(--brand)_35%,transparent)]' : 'cursor-pointer shadow-[0_15px_35px_rgba(0,0,0,0.5)]'}`}
                                style={{ transform: `translateX(${x * spread}px) scale(${scale}) rotateY(${rotate}deg)`, opacity, zIndex, filter }}
                            >
                                {item.img ? (
                                    <img src={item.img} alt={item.titleLine1} className="absolute inset-0 size-full object-cover" />
                                ) : (
                                    <div className="from-brand-2 to-brand absolute inset-0 grid place-items-center bg-gradient-to-br text-white/90 [&_svg]:size-32 [&_svg]:stroke-[1.25]">
                                        {item.icon}
                                    </div>
                                )}

                                <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.4)_0%,rgba(0,0,0,0.1)_25%,rgba(0,0,0,0.68)_60%,rgba(0,0,0,0.96)_100%)]" />

                                <div
                                    className={`relative z-20 flex size-full flex-col justify-between px-[18px] pt-5 pb-[22px] text-center transition duration-500 ${isCenter ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
                                >
                                    <div className="w-full pr-1 text-right text-[0.78rem] font-semibold tracking-wide text-white/90 [text-shadow:0_2px_6px_rgba(0,0,0,0.8)]">
                                        {item.tag}
                                    </div>

                                    <div className="mt-auto flex flex-col items-center gap-[3px] pb-1">
                                        <h2 className="m-0 text-[1.65rem] leading-[1.1] font-black tracking-wide uppercase [text-shadow:0_3px_12px_rgba(0,0,0,0.95)]">
                                            {item.titleLine1}
                                        </h2>
                                        {item.titleLine2 && (
                                            <span className="text-lg leading-tight font-bold tracking-wider text-white/90 uppercase [text-shadow:0_3px_10px_rgba(0,0,0,0.9)]">
                                                {item.titleLine2}
                                            </span>
                                        )}
                                        <div className="bg-brand mx-auto mt-[5px] mb-1 h-0.5 w-[34px] rounded-sm [box-shadow:0_0_8px_var(--brand)]" />
                                        {item.desc && (
                                            <p className="mx-0 mt-0 mb-2.5 max-w-[280px] text-[0.82rem] leading-snug text-white/90 italic [text-shadow:0_2px_8px_rgba(0,0,0,0.9)]">
                                                {item.desc}
                                            </p>
                                        )}
                                        {item.ctaText && (
                                            <a
                                                href={item.ctaUrl || '#'}
                                                onClick={(e) => {
                                                    if (onCtaClick) {
                                                        e.preventDefault();
                                                        onCtaClick(item);
                                                    }
                                                }}
                                                className="bg-brand shadow-brand/40 inline-flex items-center gap-1.5 rounded-full px-[18px] py-[7px] text-[0.72rem] font-extrabold tracking-[0.14em] text-white uppercase shadow-lg transition hover:scale-105 hover:brightness-110"
                                            >
                                                {item.ctaText} <ArrowRight className="size-3.5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {total > 1 && (
                    <>
                        {(['prev', 'next'] as const).map((dir) => (
                            <button
                                key={dir}
                                type="button"
                                onClick={dir === 'prev' ? prevSlide : nextSlide}
                                aria-label={dir === 'prev' ? 'Sebelumnya' : 'Berikutnya'}
                                className={`hover:bg-brand absolute top-1/2 z-40 grid size-[46px] -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/55 shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-md transition ${dir === 'prev' ? 'left-2 sm:left-6' : 'right-2 sm:right-6'}`}
                            >
                                {dir === 'prev' ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
                            </button>
                        ))}

                        <div className="z-30 flex items-center justify-center gap-2">
                            {items.map((_, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setCurrentIndex(idx)}
                                    aria-label={`Ke slide ${idx + 1}`}
                                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-brand w-7 [box-shadow:0_0_10px_var(--brand)]' : 'w-2 bg-white/25'}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}

export default CoverFlowCarousel;
