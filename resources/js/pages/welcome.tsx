import { CoverFlowCarousel } from '@/components/ui/3-d-coverflow-carousel';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import { DottedGlobe, type GlobeHandle } from '@/components/ui/dotted-globe';
import { PerspectiveTunnel, type TunnelImage } from '@/components/ui/perspective-tunnel-hero';
import { CrowdCanvas, type CrowdHandle } from '@/components/ui/skiper39';
import { type Service, type SharedData, type Showcase, type SiteSettings } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    AirVent,
    ArrowDown,
    ArrowRight,
    CheckCircle2,
    ClipboardList,
    ExternalLink,
    Images,
    Laptop,
    LoaderCircle,
    MapPin,
    MessageCircle,
    Minus,
    Navigation,
    Plus,
    Refrigerator,
    ShieldCheck,
    Smartphone,
    Tv,
    WashingMachine,
    Wrench,
    X,
    type LucideIcon,
} from 'lucide-react';
import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties, type FormEventHandler, type MouseEvent } from 'react';

gsap.registerPlugin(ScrollTrigger);

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

const icons: [RegExp, LucideIcon][] = [
    [/kulkas|freezer|lemari es/i, Refrigerator],
    [/\bac\b|pendingin/i, AirVent],
    [/\btv\b|televisi|audio/i, Tv],
    [/mesin cuci/i, WashingMachine],
    [/laptop|komputer|\bpc\b/i, Laptop],
    [/\bhp\b|handphone|smartphone|gadget|tablet/i, Smartphone],
];
const iconFor = (text: string) => icons.find(([re]) => re.test(text))?.[1] ?? Wrench;

const field =
    // text-base on phones: iOS zooms the whole page into any input smaller than 16px.
    'w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-base sm:text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand focus:ring-4 focus:ring-brand/15';

function Logo({ settings, className = 'size-10' }: { settings: SiteSettings; className?: string }) {
    return settings.logo_url ? (
        <img
            src={settings.logo_url}
            alt={settings.site_name}
            width={96}
            height={96}
            fetchPriority="high"
            className={`${className} rounded-xl object-contain`}
        />
    ) : (
        <span className={`${className} from-brand to-brand-2 grid place-items-center rounded-xl bg-gradient-to-br text-white`}>
            <Wrench className="size-1/2" />
        </span>
    );
}

function Navbar({ settings }: { settings: SiteSettings }) {
    const { auth } = usePage<SharedData>().props;
    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [active, setActive] = useState('');
    const quickLinks: [string, string, LucideIcon][] = [
        ['#hasil', 'Hasil', Images],
        ['#layanan', 'Layanan', Wrench],
        ['#cara-kerja', 'Cara Kerja', ClipboardList],
        ...(settings.latitude !== null ? ([['#lokasi', 'Lokasi', MapPin]] as [string, string, LucideIcon][]) : []),
        ['#pesan', 'Pesan', MessageCircle],
    ];

    // Marks the section crossing the middle of the screen in the phone's bottom bar.
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`)), {
            rootMargin: '-50% 0px -50% 0px',
        });
        document.querySelectorAll('section[id]').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    // Slides away while scrolling down, comes back as soon as the visitor scrolls up.
    useEffect(() => {
        let last = window.scrollY;
        const onScroll = () => {
            const y = window.scrollY;
            setScrolled(y > 20);
            setHidden(y > last && y > 400);
            last = y;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <>
            <header
                className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'} ${hidden ? '-translate-y-[150%]' : ''}`}
            >
                <nav
                    data-nav
                    className={`mx-4 flex max-w-6xl items-center justify-between rounded-2xl border border-neutral-200 bg-white/70 px-4 py-2 backdrop-blur-xl transition-all duration-300 lg:mx-auto ${scrolled ? 'border-brand/30 shadow-lg shadow-black/5' : 'shadow-sm'}`}
                >
                    <a href="#top" className="flex items-center gap-3">
                        <Logo settings={settings} className="size-11" />
                        {/* Two-tone wordmark like the logo: first word navy, the rest red. */}
                        <span className="max-w-[11rem] text-sm leading-tight font-extrabold tracking-tight uppercase sm:max-w-none sm:text-base">
                            <span className="text-brand-2">{settings.site_name.split(' ')[0]}</span>{' '}
                            <span className="text-brand">{settings.site_name.split(' ').slice(1).join(' ')}</span>
                        </span>
                    </a>
                    <div className="flex items-center gap-1 text-sm font-medium sm:gap-2">
                        <a href="#tentang" className="hidden rounded-full px-4 py-2 transition hover:bg-neutral-900/5 md:block">
                            Tentang
                        </a>
                        <a href="#hasil" className="hidden rounded-full px-4 py-2 transition hover:bg-neutral-900/5 lg:block">
                            Hasil
                        </a>
                        <a href="#layanan" className="hidden rounded-full px-4 py-2 transition hover:bg-neutral-900/5 md:block">
                            Layanan
                        </a>
                        <a href="#cara-kerja" className="hidden rounded-full px-4 py-2 transition hover:bg-neutral-900/5 md:block">
                            Cara Kerja
                        </a>
                        {settings.latitude !== null && (
                            <a href="#lokasi" className="hidden rounded-full px-4 py-2 transition hover:bg-neutral-900/5 lg:block">
                                Lokasi
                            </a>
                        )}
                        {auth.user && (
                            <Link href={route('dashboard')} className="rounded-full px-4 py-2 transition hover:bg-neutral-900/5">
                                Dashboard
                            </Link>
                        )}
                        <a
                            href="#pesan"
                            className="hover:bg-brand rounded-full bg-neutral-900 px-5 py-2 text-white transition hover:scale-105 active:scale-95"
                        >
                            Pesan
                        </a>
                    </div>
                </nav>
            </header>
            {/* Phones have no room for the top links: app-style bottom bar, out of the way while typing in the form. */}
            <nav
                data-bottom-nav
                aria-label="Navigasi cepat"
                className="fixed inset-x-3 bottom-3 z-50 grid auto-cols-fr grid-flow-col gap-1 rounded-2xl border border-white/10 bg-neutral-950/90 p-1.5 text-white shadow-2xl shadow-black/40 md:hidden [body:has(form_:focus)_&]:hidden"
            >
                {quickLinks.map(([href, label, Icon]) => (
                    <a
                        key={href}
                        href={href}
                        className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium whitespace-nowrap transition active:scale-95 ${active === href ? 'bg-brand text-white' : 'text-white/70'}`}
                    >
                        <Icon className="size-5" />
                        {label}
                    </a>
                ))}
            </nav>
        </>
    );
}

function Hero({ settings }: { settings: SiteSettings }) {
    const crowd = useRef<CrowdHandle>(null);
    const centerOf = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return r.left + r.width / 2;
    };

    // Click (or tap on touch screens, which have no hover): crowd turns to the button and jumps, then we scroll.
    const readMore = (e: MouseEvent<HTMLButtonElement>) => {
        crowd.current?.face(e.clientX || centerOf(e.currentTarget));
        crowd.current?.jump();
        // The section right below the hero: the showcase if there is one, otherwise the catalog.
        setTimeout(() => document.getElementById('tentang')?.scrollIntoView({ behavior: 'smooth' }), 700);
        setTimeout(() => crowd.current?.face(null), 2000);
    };

    return (
        <section id="top" className="relative isolate flex min-h-[100svh] flex-col items-center overflow-hidden bg-white pt-24 text-center sm:pt-28">
            <div
                aria-hidden
                className="bg-brand/25 animate-float pointer-events-none absolute -top-40 -left-40 -z-10 size-[36rem] rounded-full blur-3xl"
            />
            <div
                aria-hidden
                className="bg-brand-2/25 animate-float pointer-events-none absolute top-10 -right-40 -z-10 size-[30rem] rounded-full blur-3xl [animation-delay:-3s]"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#0000001a_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
            />

            <div data-hero className="relative z-10 flex max-w-5xl flex-col items-center gap-4 px-4 max-sm:my-auto sm:gap-6 sm:px-6">
                {/* Sized to the screen width so the title stays on two lines on phones. */}
                <h1 className="text-[clamp(1.5rem,7.4vw,2.25rem)] leading-[1.1] font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl">
                    <span className="from-brand via-brand-2 to-brand bg-gradient-to-r bg-[length:200%_auto] bg-clip-text text-transparent">
                        {settings.hero_title}
                    </span>
                </h1>
                {settings.hero_subtitle && (
                    <p className="max-w-xl text-sm font-medium text-pretty text-neutral-700 sm:text-lg">{settings.hero_subtitle}</p>
                )}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        onMouseMove={(e) => crowd.current?.face(e.clientX)}
                        onMouseLeave={() => crowd.current?.face(null)}
                        onFocus={(e) => crowd.current?.face(centerOf(e.currentTarget))}
                        onBlur={() => crowd.current?.face(null)}
                        onClick={readMore}
                        className="group from-brand to-brand-2 shadow-brand/30 hover:shadow-brand/50 relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-xl transition hover:scale-105 active:scale-95 sm:px-8 sm:py-4 sm:text-base"
                    >
                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                        Read more
                        <ArrowDown className="size-4 transition group-hover:translate-y-1" />
                    </button>
                    <a
                        href="#pesan"
                        className="border-brand-2 text-brand-2 hover:bg-brand-2 inline-flex items-center gap-2 rounded-full border-2 bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap shadow-xl shadow-black/10 transition hover:scale-105 hover:text-white active:scale-95 sm:px-8 sm:py-4 sm:text-base"
                    >
                        Pesan sekarang
                    </a>
                </div>
            </div>

            {/* Crowd sits below the text and is scaled to fit this area, so it never covers the copy. */}
            <div data-crowd className="relative mt-4 min-h-[260px] w-full max-sm:h-[40svh] max-sm:flex-none sm:flex-1">
                <CrowdCanvas ref={crowd} src="/images/peeps.png" className="pointer-events-none absolute inset-0 size-full" />
            </div>
        </section>
    );
}

function Marquee({ items }: { items: string[] }) {
    return (
        <div data-marquee className="from-brand to-brand-2 relative z-10 -rotate-1 overflow-hidden bg-gradient-to-r py-4 text-white shadow-xl">
            <div className="animate-marquee flex w-max gap-10 text-lg font-bold tracking-wide whitespace-nowrap uppercase">
                {[...items, ...items].map((item, i) => (
                    <span key={i} className="flex items-center gap-10">
                        {item} <span className="size-2 rounded-full bg-white/60" />
                    </span>
                ))}
            </div>
        </div>
    );
}

function ServiceCard({ service, onOrder }: { service: Service; onOrder: () => void }) {
    const Icon = iconFor(`${service.name} ${service.category}`);
    const spotlight = (e: MouseEvent<HTMLElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
    };

    return (
        <article
            onMouseMove={spotlight}
            className="group hover:shadow-brand/20 relative flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
        >
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background:
                        'radial-gradient(400px circle at var(--mx) var(--my), color-mix(in srgb, var(--brand) 14%, transparent), transparent 60%)',
                }}
            />
            {service.image_url ? (
                <div className="relative -mx-6 -mt-6 mb-5 h-44 overflow-hidden">
                    <img
                        src={service.image_url}
                        alt={service.name}
                        className="size-full object-cover transition duration-500 group-hover:scale-110"
                    />
                </div>
            ) : (
                <span className="from-brand to-brand-2 shadow-brand/30 relative mb-5 grid size-14 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <Icon className="size-7" />
                </span>
            )}
            <span className="text-brand relative text-xs font-semibold tracking-wider uppercase">{service.category}</span>
            <h3 className="relative mt-1 text-xl font-bold">{service.name}</h3>
            {service.description && <p className="relative mt-2 flex-1 text-sm text-neutral-600">{service.description}</p>}
            <div className="relative mt-6 flex items-end justify-between gap-4">
                <div>
                    <span className="block text-xs text-neutral-500">Mulai dari</span>
                    <span className="text-lg font-bold">{rupiah.format(service.price_from)}</span>
                </div>
                <button
                    type="button"
                    onClick={onOrder}
                    className="group-hover:bg-brand inline-flex items-center gap-1 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition active:scale-95"
                >
                    Pesan <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </button>
            </div>
        </article>
    );
}

const stepIcons = [ClipboardList, MessageCircle, ShieldCheck];

// Each word in its own clipping box so it can rise into view (driven by the [data-word] tween below).
// Not for gradient text: transformed children break background-clip: text.
function Words({ text }: { text: string }) {
    return text.split(' ').map((word, i) => (
        <Fragment key={i}>
            <span className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                <span data-word className="inline-block">
                    {word}
                </span>
            </span>{' '}
        </Fragment>
    ));
}

const revealFrom: Record<string, gsap.TweenVars> = {
    up: { y: 60 },
    left: { x: -80 },
    right: { x: 80 },
    zoom: { scale: 0.85, y: 30 },
    tilt: { y: 80, rotateX: -35, transformPerspective: 900, transformOrigin: '50% 100%' },
};

// Dotted globe with the shop marker; clicking it flies in and opens the detailed map.
function LocationSection({ settings, lat, lng }: { settings: SiteSettings; lat: number; lng: number }) {
    const c = settings.content;
    const globe = useRef<GlobeHandle>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const [focused, setFocused] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const directions = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    const openInMaps = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    useEffect(() => {
        if (showMap)
            gsap.fromTo(
                mapRef.current,
                { clipPath: 'circle(0% at 50% 50%)' },
                { clipPath: 'circle(75% at 50% 50%)', duration: 0.9, ease: 'power3.out' },
            );
    }, [showMap]);

    // Shrink the map back into the marker, then let the globe zoom out.
    const close = () =>
        gsap.to(mapRef.current, {
            clipPath: 'circle(0% at 50% 50%)',
            duration: 0.6,
            ease: 'power3.in',
            onComplete: () => {
                setShowMap(false);
                setFocused(false);
            },
        });

    useEffect(() => {
        if (!showMap) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [showMap]);

    return (
        <section id="lokasi" data-section className="relative scroll-mt-24 overflow-hidden bg-black px-6 pt-16 pb-28 text-white sm:py-24">
            <div
                aria-hidden
                data-speed="-40"
                className="bg-brand/25 pointer-events-none absolute top-1/2 right-0 size-[36rem] -translate-y-1/2 rounded-full blur-3xl"
            />
            <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
                <div data-reveal="left">
                    <span className="text-sm font-semibold tracking-wider text-[color-mix(in_srgb,var(--brand)_55%,white)] uppercase">
                        {c.location_label}
                    </span>
                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
                        <Words text={c.location_title} />
                    </h2>
                    <p className="mt-4 text-white/70">{c.location_text}</p>
                    {settings.address && (
                        <p className="mt-6 flex items-start gap-3 text-sm">
                            <MapPin className="text-brand mt-0.5 size-5 shrink-0" /> {settings.address}
                        </p>
                    )}
                    <div className="mt-8 flex flex-wrap gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={() => (showMap ? close() : setFocused(true))}
                            disabled={focused && !showMap}
                            className="bg-brand shadow-brand/40 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-60 sm:px-6 sm:text-base"
                        >
                            <MapPin className="size-4" /> {showMap ? 'Kembali ke globe' : 'Lihat lokasi'}
                        </button>
                        <a
                            href={directions}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold transition hover:bg-white hover:text-black sm:px-6 sm:text-base"
                        >
                            <Navigation className="size-4" /> Petunjuk arah
                        </a>
                    </div>
                </div>

                <div data-reveal="zoom" className="relative mx-auto aspect-square w-full max-w-[560px]">
                    <DottedGlobe
                        ref={globe}
                        lat={lat}
                        lng={lng}
                        label={settings.site_name}
                        focused={focused}
                        onMarkerClick={() => setFocused(true)}
                        onFocusComplete={() => setShowMap(true)}
                        className="absolute inset-0 size-full"
                    />

                    {!focused && (
                        <>
                            <div className="absolute right-2 bottom-2 flex flex-col overflow-hidden rounded-full border border-white/15 bg-white/10 backdrop-blur">
                                <button
                                    type="button"
                                    aria-label="Perbesar"
                                    onClick={() => globe.current?.zoomBy(1.5)}
                                    className="grid size-9 place-items-center hover:bg-white/15"
                                >
                                    <Plus className="size-4" />
                                </button>
                                <button
                                    type="button"
                                    aria-label="Perkecil"
                                    onClick={() => globe.current?.zoomBy(1 / 1.5)}
                                    className="grid size-9 place-items-center hover:bg-white/15"
                                >
                                    <Minus className="size-4" />
                                </button>
                            </div>
                        </>
                    )}

                    {showMap && (
                        <div
                            ref={mapRef}
                            className="absolute inset-0 overflow-hidden rounded-3xl border border-white/15 bg-neutral-900"
                            style={{ clipPath: 'circle(0% at 50% 50%)' }}
                        >
                            <iframe
                                title={`Lokasi ${settings.site_name}`}
                                src={`https://maps.google.com/maps?q=${lat},${lng}&z=${Number(c.map_zoom) || 16}&output=embed`}
                                className="size-full"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                            <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
                                <button
                                    type="button"
                                    onClick={close}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-2 text-xs font-semibold backdrop-blur transition hover:bg-black"
                                >
                                    <X className="size-3.5" /> Tutup peta
                                </button>
                                <a
                                    href={openInMaps}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-brand inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold shadow-lg transition hover:brightness-110"
                                >
                                    Buka di Google Maps <ExternalLink className="size-3.5" />
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default function Welcome({ services, showcases }: { services: Service[]; showcases: Showcase[] }) {
    const { settings } = usePage<SharedData>().props;
    const c = settings.content;
    const steps = stepIcons.map((icon, i) => ({ icon, title: c[`step${i + 1}_title`], text: c[`step${i + 1}_text`] }));
    const categories = useMemo(() => ['Semua', ...new Set(services.map((s) => s.category))], [services]);
    const [category, setCategory] = useState('Semua');
    const [sent, setSent] = useState(false);
    const shown = category === 'Semua' ? services : services.filter((s) => s.category === category);
    const tunnelImages = useMemo(
        () =>
            [
                ...showcases.map((s) => ({ src: s.image_url, title: s.title })),
                { src: settings.scroll_image_url, title: c.scroll_label },
                ...services.map((s) => ({ src: s.image_url, title: s.name })),
            ].filter((img): img is TunnelImage => !!img.src),
        [showcases, services, settings.scroll_image_url, c.scroll_label],
    );

    const { data, setData, post, processing, errors, reset } = useForm({ service_id: '', name: '', phone: '', device: '', complaint: '' });

    const orderService = (id: number) => {
        setData('service_id', String(id));
        document.getElementById('pesan')?.scrollIntoView({ behavior: 'smooth' });
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('orders.store'), {
            preserveScroll: true,
            onSuccess: (page) => {
                reset();
                setSent(true);
                const url = (page.props.flash as SharedData['flash']).wa_url;
                if (url) window.location.href = url;
            },
        });
    };

    useEffect(() => {
        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', () => {
            // Opening sequence: logo screen, two-layer curtain lifts, then the page builds itself up.
            gsap.timeline({ defaults: { ease: 'power3.out' } })
                .from('[data-intro-logo]', { scale: 0.4, rotate: -15, opacity: 0, duration: 0.7, ease: 'back.out(1.8)' })
                .from('[data-intro-name]', { y: 24, opacity: 0, letterSpacing: '0.5em', duration: 0.6 }, '-=0.3')
                .to('[data-intro-bar]', { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }, '-=0.2')
                .to('[data-intro-layer]', { yPercent: -100, duration: 0.9, ease: 'power4.inOut', stagger: { each: 0.14, from: 'end' } })
                .set('[data-intro]', { display: 'none' })
                .from('[data-nav] > *', { y: -40, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.5')
                .from('[data-bottom-nav]', { yPercent: 150, duration: 0.7 }, '<')
                .fromTo('[data-hero] h1', { y: 80, clipPath: 'inset(100% 0 0 0)' }, { y: 0, clipPath: 'inset(0% 0 0 0)', duration: 1 }, '<')
                .from('[data-hero] > :not(h1)', { y: 40, opacity: 0, duration: 0.8, stagger: 0.12 }, '-=0.6')
                .from('[data-crowd]', { y: 140, opacity: 0, duration: 1.1 }, '-=0.7')
                .from('[data-marquee]', { xPercent: -100, duration: 1 }, '-=0.9');

            // Reading progress bar along the top edge.
            gsap.to('[data-progress]', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

            // Hero text drifts up and fades as the page leaves it.
            gsap.to('[data-hero]', {
                yPercent: -35,
                opacity: 0,
                ease: 'none',
                scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: true },
            });

            // data-reveal="up|left|right|zoom|tilt": where the element comes in from. Plays again in reverse when
            // scrolling back up past it, so the page moves in both directions.
            const hidden = (el: Element) => ({ opacity: 0, ...(revealFrom[(el as HTMLElement).dataset.reveal ?? ''] ?? revealFrom.up) });
            gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => gsap.set(el, hidden(el)));
            ScrollTrigger.batch('[data-reveal]', {
                start: 'top 88%',
                onEnter: (els) =>
                    gsap.to(els, { x: 0, y: 0, scale: 1, rotateX: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out', overwrite: true }),
                onLeaveBack: (els) => els.forEach((el) => gsap.to(el, { ...hidden(el), duration: 0.5, ease: 'power2.in', overwrite: true })),
            });

            // Headings: words rise one by one, tied to the scroll position.
            gsap.utils.toArray<HTMLElement>('h2:has([data-word])').forEach((h) =>
                gsap.from(h.querySelectorAll('[data-word]'), {
                    yPercent: 110,
                    rotate: 8,
                    stagger: 0.08,
                    ease: 'none',
                    scrollTrigger: { trigger: h, start: 'top 92%', end: 'top 60%', scrub: 0.6 },
                }),
            );

            // Dark sections grow from a rounded card to full width as they come up.
            gsap.utils
                .toArray<HTMLElement>('[data-section]')
                .forEach((el) =>
                    gsap.fromTo(
                        el,
                        { scale: 0.9, borderRadius: 48 },
                        { scale: 1, borderRadius: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 25%', scrub: true } },
                    ),
                );

            // The red ribbon leans with the scroll speed and straightens when scrolling stops.
            const skew = gsap.quickTo('[data-marquee]', 'skewX', { duration: 0.5, ease: 'power3.out' });
            let settle: number;
            ScrollTrigger.create({
                onUpdate: (self) => {
                    skew(gsap.utils.clamp(-12, 12, self.getVelocity() / -200));
                    clearTimeout(settle);
                    settle = window.setTimeout(() => skew(0), 120);
                },
            });

            // data-speed: parallax drift (in % of the element's height) while its section crosses the screen.
            gsap.utils.toArray<HTMLElement>('[data-speed]').forEach((el) =>
                gsap.to(el, {
                    yPercent: Number(el.dataset.speed),
                    ease: 'none',
                    scrollTrigger: { trigger: el.closest('section') ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
                }),
            );
        });
        return () => mm.revert();
    }, []);

    return (
        <div
            className="min-h-screen overflow-x-clip bg-white font-sans text-neutral-900 antialiased"
            style={{ '--brand': settings.primary_color, '--brand-2': settings.secondary_color } as CSSProperties}
        >
            <Head title={settings.tagline ? `${settings.site_name} — ${settings.tagline}` : settings.site_name}>
                <meta name="description" content={settings.hero_subtitle ?? settings.site_name} />
                {settings.logo_url && <link rel="icon" href={settings.logo_url} />}
            </Head>

            <div
                data-progress
                aria-hidden
                className="from-brand to-brand-2 fixed inset-x-0 top-0 z-[60] h-1 origin-left scale-x-0 bg-gradient-to-r"
            />
            {/* Opening screen; lifted by the intro timeline, never shown with reduced motion. */}
            <div data-intro aria-hidden className="pointer-events-none fixed inset-0 z-[100] motion-reduce:hidden">
                <div data-intro-layer className="bg-brand absolute inset-0" />
                <div data-intro-layer className="bg-brand-2 absolute inset-0 grid place-items-center">
                    <div className="flex flex-col items-center gap-6 px-6 text-center">
                        <div data-intro-logo className="rounded-3xl bg-white p-4 shadow-2xl shadow-black/40">
                            <Logo settings={settings} className="size-20 sm:size-24" />
                        </div>
                        <p data-intro-name className="text-sm font-extrabold tracking-[0.25em] text-white uppercase sm:text-xl sm:tracking-[0.3em]">
                            {settings.site_name}
                        </p>
                        <span className="block h-0.5 w-48 overflow-hidden rounded-full bg-white/15">
                            <span data-intro-bar className="bg-brand block h-full origin-left scale-x-0" />
                        </span>
                    </div>
                </div>
            </div>
            <Navbar settings={settings} />
            <Hero settings={settings} />
            <Marquee
                items={[
                    ...categories.slice(1),
                    ...c.marquee
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean),
                ]}
            />

            <ContainerScroll
                id="tentang"
                titleComponent={
                    <div className="mb-20 px-4">
                        <span className="text-brand text-sm font-semibold tracking-wider uppercase">{c.scroll_label}</span>
                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl">
                            <span className="from-brand-2 to-brand bg-gradient-to-r bg-clip-text text-transparent">{c.scroll_title}</span>
                        </h2>
                    </div>
                }
            >
                <img
                    src={settings.scroll_image_url}
                    alt={c.scroll_title}
                    className="mx-auto h-full w-full rounded-2xl object-cover object-left-top"
                    draggable={false}
                />
            </ContainerScroll>

            {tunnelImages.length > 0 && (
                <PerspectiveTunnel images={tunnelImages} label={c.tunnel_label} title={c.tunnel_title} text={c.tunnel_text} />
            )}

            <div data-section className="overflow-hidden">
                <CoverFlowCarousel
                    id="hasil"
                    className="scroll-mt-0"
                    sectionLabel={c.showcase_label}
                    title={c.showcase_title}
                    items={showcases.map((s) => {
                        const Icon = iconFor(`${s.title} ${s.tag ?? ''}`);
                        return {
                            tag: s.tag,
                            titleLine1: s.title,
                            titleLine2: s.subtitle,
                            desc: s.description,
                            img: s.image_url,
                            icon: <Icon />,
                            ctaText: 'Pesan servis serupa',
                        };
                    })}
                    onCtaClick={() => document.getElementById('pesan')?.scrollIntoView({ behavior: 'smooth' })}
                />
            </div>

            <section id="layanan" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16 sm:py-24">
                <div data-reveal className="mx-auto max-w-2xl text-center">
                    <span className="text-brand text-sm font-semibold tracking-wider uppercase">{c.services_label}</span>
                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
                        <Words text={c.services_title} />
                    </h2>
                </div>

                {/* Phones: one swipeable row instead of a pile of wrapped chips. */}
                <div
                    data-reveal
                    className="-mx-6 mt-8 flex gap-2 overflow-x-auto px-6 pb-2 [scrollbar-width:none] sm:mx-0 sm:mt-10 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 sm:pb-0"
                >
                    {categories.map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setCategory(c)}
                            className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium transition ${c === category ? 'bg-brand shadow-brand/30 text-white shadow-lg' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
                        >
                            {c}
                        </button>
                    ))}
                </div>

                {/* Phones: swipe sideways through the cards, the next one peeking in, instead of six screens of scrolling. */}
                <div
                    key={category}
                    className="-mx-6 mt-6 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 py-4 [scrollbar-width:none] sm:mx-0 sm:mt-12 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:p-0 lg:grid-cols-3"
                >
                    {shown.map((service) => (
                        <div key={service.id} data-reveal="zoom" className="w-[82vw] max-w-sm shrink-0 snap-start sm:w-auto sm:max-w-none">
                            <ServiceCard service={service} onOrder={() => orderService(service.id)} />
                        </div>
                    ))}
                </div>
                {services.length === 0 && <p className="mt-12 text-center text-neutral-500">Belum ada layanan.</p>}
            </section>

            <section id="cara-kerja" data-section className="bg-brand-2 relative scroll-mt-24 overflow-hidden px-6 py-16 text-white sm:py-24">
                <div
                    aria-hidden
                    data-speed="60"
                    className="bg-brand/30 absolute -top-32 left-1/2 size-[40rem] -translate-x-1/2 rounded-full blur-3xl"
                />
                <div className="relative mx-auto max-w-6xl">
                    <div data-reveal className="mx-auto max-w-2xl text-center">
                        <span className="text-sm font-semibold tracking-wider text-white/60 uppercase">{c.steps_label}</span>
                        <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
                            <Words text={c.steps_title} />
                        </h2>
                    </div>
                    <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-6">
                        {steps.map(({ icon: Icon, title, text }, i) => (
                            <div
                                key={i}
                                data-reveal="tilt"
                                className="group hover:border-brand/60 relative grid grid-cols-[auto_1fr] gap-x-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:bg-white/10 md:block md:p-8"
                            >
                                <span
                                    data-speed="-80"
                                    className="absolute top-6 right-8 text-6xl font-black text-white/5 transition group-hover:text-white/10"
                                >
                                    0{i + 1}
                                </span>
                                <span className="bg-brand shadow-brand/40 row-span-2 grid size-12 place-items-center rounded-2xl shadow-lg transition group-hover:scale-110 group-hover:-rotate-6 md:size-14">
                                    <Icon className="size-7" />
                                </span>
                                <h3 className="text-lg font-bold md:mt-6 md:text-xl">{title}</h3>
                                <p className="mt-1 text-sm text-white/70 md:mt-2 md:text-base">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="pesan" className="mx-auto grid max-w-6xl scroll-mt-24 gap-10 px-6 pt-16 pb-28 sm:py-24 lg:grid-cols-2 lg:gap-12">
                <div data-reveal="left" className="flex flex-col justify-center">
                    <span className="text-brand text-sm font-semibold tracking-wider uppercase">{c.order_label}</span>
                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
                        <Words text={c.order_title} />
                    </h2>
                    <p className="mt-4 text-neutral-600">{c.order_text}</p>
                    <ul className="mt-8 space-y-3 text-sm">
                        {settings.whatsapp && (
                            <li className="flex items-center gap-3">
                                <MessageCircle className="text-brand size-5" /> +{settings.whatsapp.replace(/\D/g, '')}
                            </li>
                        )}
                        {settings.address && (
                            <li className="flex items-center gap-3">
                                <MapPin className="text-brand size-5" /> {settings.address}
                            </li>
                        )}
                    </ul>
                </div>

                <form
                    data-reveal="right"
                    onSubmit={submit}
                    className="shadow-brand/10 relative space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl sm:p-8"
                >
                    <div aria-hidden className="from-brand to-brand-2 absolute inset-x-8 -top-px h-px bg-gradient-to-r" />
                    {sent && (
                        <p className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                            <CheckCircle2 className="size-4" /> Pesanan terkirim! Membuka WhatsApp…
                        </p>
                    )}
                    <label className="block space-y-1.5 text-sm font-medium">
                        <span>Layanan</span>
                        <select className={field} value={data.service_id} onChange={(e) => setData('service_id', e.target.value)}>
                            <option value="">Belum tahu / lainnya</option>
                            {services.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block space-y-1.5 text-sm font-medium">
                            <span>Nama</span>
                            <input
                                className={field}
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                maxLength={100}
                                autoComplete="name"
                            />
                            {errors.name && <span className="text-xs text-red-600">{errors.name}</span>}
                        </label>
                        <label className="block space-y-1.5 text-sm font-medium">
                            <span>No. HP / WhatsApp</span>
                            <input
                                className={field}
                                type="tel"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                required
                                maxLength={20}
                                autoComplete="tel"
                            />
                            {errors.phone && <span className="text-xs text-red-600">{errors.phone}</span>}
                        </label>
                    </div>
                    <label className="block space-y-1.5 text-sm font-medium">
                        <span>Merek / tipe alat</span>
                        <input
                            className={field}
                            value={data.device}
                            onChange={(e) => setData('device', e.target.value)}
                            required
                            maxLength={100}
                            placeholder="mis. TV Samsung 43 inch"
                        />
                        {errors.device && <span className="text-xs text-red-600">{errors.device}</span>}
                    </label>
                    <label className="block space-y-1.5 text-sm font-medium">
                        <span>Keluhan</span>
                        <textarea
                            className={`${field} min-h-28`}
                            value={data.complaint}
                            onChange={(e) => setData('complaint', e.target.value)}
                            required
                            maxLength={1000}
                            placeholder="mis. layar bergaris, ada suara tapi tidak ada gambar"
                        />
                        {errors.complaint && <span className="text-xs text-red-600">{errors.complaint}</span>}
                    </label>
                    <button
                        disabled={processing}
                        className="from-brand to-brand-2 shadow-brand/30 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-6 py-4 font-semibold text-white shadow-lg transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
                    >
                        {processing ? <LoaderCircle className="size-5 animate-spin" /> : <MessageCircle className="size-5" />}
                        Kirim & lanjut ke WhatsApp
                    </button>
                </form>
            </section>

            {settings.latitude !== null && settings.longitude !== null && (
                <LocationSection settings={settings} lat={settings.latitude} lng={settings.longitude} />
            )}
        </div>
    );
}
