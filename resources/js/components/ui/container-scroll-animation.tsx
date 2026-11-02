import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, type ReactNode } from 'react';

gsap.registerPlugin(ScrollTrigger);

// Adapted from Aceternity UI's ContainerScroll: same effect, driven by GSAP ScrollTrigger (already installed) instead of framer-motion.
export const ContainerScroll = ({ titleComponent, children, id }: { titleComponent: ReactNode; children: ReactNode; id?: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const mediaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mm = gsap.matchMedia();
        // matchMedia only runs the callback when at least one condition matches, so desktop needs its own query.
        mm.add({ isMobile: '(max-width: 768px)', isDesktop: '(min-width: 769px)', reduceMotion: '(prefers-reduced-motion: reduce)' }, (context) => {
            const { isMobile, reduceMotion } = context.conditions as { isMobile: boolean; reduceMotion: boolean };
            if (reduceMotion) return;

            // Starts as the section enters the viewport, finishes when it is centred, so the motion stays in view.
            // scrub: 1 adds a short catch-up so the frame glides instead of following the wheel step by step.
            const tl = gsap.timeline({ scrollTrigger: { trigger: containerRef.current, start: 'top bottom', end: 'center center', scrub: 1 } });
            tl.fromTo(
                cardRef.current,
                { rotateX: 40, scale: isMobile ? 0.6 : 0.8, y: 120 },
                { rotateX: 0, scale: isMobile ? 0.9 : 1, y: 0, ease: 'power1.out' },
                0,
            );
            tl.fromTo(mediaRef.current, { scale: 1.35 }, { scale: 1, ease: 'power1.out' }, 0);
            tl.fromTo(headerRef.current, { y: 80, opacity: 0 }, { y: -60, opacity: 1, ease: 'power1.out' }, 0);
        });
        return () => mm.revert();
    }, []);

    return (
        <div id={id} ref={containerRef} className="relative flex h-[60rem] items-center justify-center p-2 md:h-[80rem] md:p-20">
            <div className="relative w-full py-10 md:py-40 [perspective:1000px]">
                <div ref={headerRef} className="mx-auto max-w-5xl text-center">
                    {titleComponent}
                </div>
                <div
                    ref={cardRef}
                    className="mx-auto -mt-12 h-[30rem] origin-bottom w-full max-w-5xl rounded-[30px] border-4 border-[#6C6C6C] bg-[#222222] p-2 shadow-2xl md:h-[40rem] md:p-6"
                    style={{
                        boxShadow:
                            '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003',
                    }}
                >
                    <div className="h-full w-full overflow-hidden rounded-2xl bg-gray-100">
                        <div ref={mediaRef} className="h-full w-full">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContainerScroll;
