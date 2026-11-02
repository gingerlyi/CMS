import AppLayout from '@/layouts/app-layout';
import { statusColors, statusLabels } from '@/lib/order-status';
import { type BreadcrumbItem, type Order, type OrderStatus, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, ExternalLink, Images, Palette, Wrench } from 'lucide-react';
import { useEffect, useId, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';

// Bento layout and motion adapted from the web3-bento component (21st.dev), filled with the shop's own data.

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

type Day = { date: string; masuk: number; selesai: number };
type Props = {
    daily: Day[];
    counts: Partial<Record<OrderStatus, number>>;
    topServices: { label: string; value: number }[];
    weekdays: number[];
    newOrders: Order[];
    latest: Order[];
    content: { services: number; showcases: number };
};

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const STATUSES = Object.keys(statusLabels) as OrderStatus[];
const statusFill: Record<OrderStatus, string> = {
    baru: 'var(--brand)',
    diproses: 'oklch(0.78 0.14 70)',
    selesai: 'oklch(0.68 0.14 160)',
    batal: 'var(--muted-foreground)',
};
const serviceFill = ['var(--brand)', 'color-mix(in oklch, var(--brand) 50%, white)', 'oklch(0.6 0.06 255)', 'oklch(0.75 0.03 255)', 'var(--muted-foreground)'];
const weekdayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const num = new Intl.NumberFormat('id-ID');
const dayLabel = (date: string) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
const rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto' });
const timeAgo = (iso: string) => {
    const s = (Date.parse(iso) - Date.now()) / 1000;
    for (const [unit, sec] of [['day', 86400], ['hour', 3600], ['minute', 60]] as const) {
        if (Math.abs(s) >= sec) return rtf.format(Math.round(s / sec), unit);
    }
    return 'baru saja';
};

function useMounted() {
    const [on, setOn] = useState(false);
    useEffect(() => {
        const id = requestAnimationFrame(() => setOn(true));
        return () => cancelAnimationFrame(id);
    }, []);
    return on;
}

function useCountUp(target: number, duration = 1300) {
    const [v, setV] = useState(0);
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setV(target);
        let raf = 0;
        const t0 = performance.now();
        const tick = (now: number) => {
            const p = Math.min(1, (now - t0) / duration);
            setV(target * (1 - Math.pow(1 - p, 4)));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, duration]);
    return Math.round(v);
}

function smooth(pts: ReadonlyArray<readonly [number, number]>) {
    return pts
        .map(([x, y], i) => {
            if (i === 0) return `M ${x.toFixed(1)} ${y.toFixed(1)}`;
            const [px, py] = pts[i - 1];
            const m = (px + x) / 2;
            return `C ${m.toFixed(1)} ${py.toFixed(1)}, ${m.toFixed(1)} ${y.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(' ');
}

function Tile({ title, action, className = '', style, children }: { title?: ReactNode; action?: ReactNode; className?: string; style?: CSSProperties; children: ReactNode }) {
    return (
        <section className={`bg-card text-card-foreground relative flex min-w-0 flex-col overflow-hidden rounded-[26px] border p-5 ${className}`} style={style}>
            {(title || action) && (
                <header className="mb-4 flex items-center justify-between gap-3">
                    {title && <h3 className="text-muted-foreground text-[13px] font-medium">{title}</h3>}
                    {action}
                </header>
            )}
            {children}
        </section>
    );
}

function Pills<T extends string>({ value, options, onChange, label }: { value: T; options: T[]; onChange: (v: T) => void; label: string }) {
    return (
        <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border p-0.5">
            {options.map((o) => (
                <button
                    key={o}
                    type="button"
                    role="radio"
                    aria-checked={o === value}
                    onClick={() => onChange(o)}
                    className={`focus-visible:ring-ring rounded-full px-2.5 py-1 font-mono text-[11px] font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${o === value ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    {o}
                </button>
            ))}
        </div>
    );
}

/* Hero: greeting, 30-day total and daily bars */
function HeroTile({ name, daily }: { name: string; daily: Day[] }) {
    const mounted = useMounted();
    const month = daily.slice(-30);
    const total = month.reduce((s, d) => s + d.masuk, 0);
    const prev = daily.slice(-60, -30).reduce((s, d) => s + d.masuk, 0);
    const shown = useCountUp(total);
    const change = total - prev;
    const pct = prev ? (change / prev) * 100 : 0;
    const max = Math.max(...month.map((d) => d.masuk), 1);
    const [hover, setHover] = useState<number | null>(null);

    return (
        <Tile className="sm:col-span-2 lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="min-w-0">
                    <p className="text-[28px] leading-[1.1] font-semibold tracking-[-0.03em] sm:text-[34px]">
                        Halo, <span className="text-brand">{name}</span>
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">Ringkasan bengkel 30 hari terakhir.</p>
                </div>
                <div className="text-right">
                    <p className="text-muted-foreground text-[12px]">Pesanan masuk</p>
                    <p className="font-mono text-[34px] leading-none font-semibold tracking-[-0.04em] tabular-nums sm:text-[40px]">{num.format(shown)}</p>
                    <p className="mt-1.5 font-mono text-[12px] tabular-nums">
                        <span className={change >= 0 ? 'text-brand' : 'text-muted-foreground'}>
                            {change >= 0 ? '+' : '−'}
                            {Math.abs(change)} ({pct.toFixed(0)}%)
                        </span>
                        <span className="text-muted-foreground"> · vs 30 hari lalu</span>
                    </p>
                </div>
            </div>

            <div className="mt-6 flex flex-1 flex-col">
                <div className="flex flex-1 items-end gap-[3px]" style={{ minHeight: 72 }} onPointerLeave={() => setHover(null)}>
                    {month.map((d, i) => (
                        <button
                            key={d.date}
                            type="button"
                            onPointerEnter={() => setHover(i)}
                            onFocus={() => setHover(i)}
                            onBlur={() => setHover(null)}
                            aria-label={`${dayLabel(d.date)}: ${d.masuk} pesanan`}
                            className="bg-brand focus-visible:ring-ring relative flex-1 rounded-[4px] focus-visible:ring-2 focus-visible:outline-none"
                            style={{
                                height: mounted ? `${8 + (d.masuk / max) * 92}%` : '6%',
                                opacity: hover === null ? 0.3 + (d.masuk / max) * 0.7 : hover === i ? 1 : 0.2,
                                transition: `height 900ms ${EASE} ${i * 18}ms, opacity 200ms ease`,
                            }}
                        />
                    ))}
                </div>
                <div className="text-muted-foreground mt-2 flex items-center justify-between font-mono text-[11px]">
                    <span>{dayLabel(month[0].date)}</span>
                    <span className="text-foreground" aria-live="polite">
                        {hover !== null ? `${dayLabel(month[hover].date)} · ${month[hover].masuk} pesanan` : 'Pesanan per hari'}
                    </span>
                    <span>Hari ini</span>
                </div>
            </div>
        </Tile>
    );
}

/* Orders by status: segmented bar */
function StatusTile({ counts }: { counts: Props['counts'] }) {
    const mounted = useMounted();
    const total = STATUSES.reduce((s, k) => s + (counts[k] ?? 0), 0);
    const [hover, setHover] = useState<OrderStatus | null>(null);

    return (
        <Tile title="Status pesanan">
            <p className="font-mono text-[22px] font-semibold tabular-nums">
                {num.format(total)} <span className="text-muted-foreground text-sm">total</span>
            </p>
            <div className="mt-4 flex h-9 gap-1" onPointerLeave={() => setHover(null)}>
                {total === 0 && <span className="bg-muted flex-1 rounded-[8px]" aria-hidden />}
                {total > 0 &&
                    STATUSES.map((k, i) => (
                    <span
                        key={k}
                        onPointerEnter={() => setHover(k)}
                        className="min-w-1 rounded-[8px]"
                        style={{
                            flexBasis: mounted ? `${((counts[k] ?? 0) / total) * 100}%` : '25%',
                            background: statusFill[k],
                            opacity: hover === null || hover === k ? 1 : 0.3,
                            transition: `flex-basis 1000ms ${EASE} ${200 + i * 60}ms, opacity 200ms ease`,
                        }}
                        aria-hidden
                    />
                ))}
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                {STATUSES.map((k) => (
                    <li key={k} onPointerEnter={() => setHover(k)} onPointerLeave={() => setHover(null)}>
                        <Link href={`/admin/orders?status=${k}`} className="flex items-center justify-between gap-2 text-[12px] hover:underline">
                            <span className="flex items-center gap-2">
                                <span className="size-2 rounded-full" style={{ background: statusFill[k] }} aria-hidden />
                                {statusLabels[k]}
                            </span>
                            <span className="text-muted-foreground font-mono tabular-nums">{counts[k] ?? 0}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </Tile>
    );
}

/* Completion rate: semicircle gauge */
function CompletionTile({ counts }: { counts: Props['counts'] }) {
    const mounted = useMounted();
    const done = counts.selesai ?? 0;
    const relevant = STATUSES.reduce((s, k) => s + (counts[k] ?? 0), 0) - (counts.batal ?? 0);
    const t = relevant ? done / relevant : 0;
    const len = Math.PI * 62;

    return (
        <Tile title="Tingkat selesai" action={<span className="text-muted-foreground font-mono text-[11px]">tanpa batal</span>}>
            <div className="flex flex-1 flex-col items-center justify-center">
                <svg width="150" height="86" viewBox="0 0 150 86" aria-hidden>
                    <path d="M 13 78 A 62 62 0 0 1 137 78" fill="none" strokeWidth="10" strokeLinecap="round" style={{ stroke: 'var(--muted)' }} />
                    <path
                        d="M 13 78 A 62 62 0 0 1 137 78"
                        fill="none"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={len}
                        style={{ stroke: 'var(--brand)', strokeDashoffset: len * (1 - (mounted ? t : 0)), transition: `stroke-dashoffset 1200ms ${EASE}` }}
                    />
                    <g style={{ transform: `rotate(${-90 + (mounted ? t : 0) * 180}deg)`, transformOrigin: '75px 78px', transition: `transform 1200ms ${EASE}` }}>
                        <line x1="75" y1="78" x2="75" y2="30" strokeWidth="2.5" strokeLinecap="round" style={{ stroke: 'var(--foreground)' }} />
                    </g>
                    <circle cx="75" cy="78" r="5" style={{ fill: 'var(--foreground)' }} />
                </svg>
                <p className="mt-2 font-mono text-[26px] leading-none font-semibold tabular-nums">
                    {(t * 100).toFixed(0)}
                    <span className="text-muted-foreground text-sm">%</span>
                </p>
                <p className="text-muted-foreground mt-1 font-mono text-[11px] tabular-nums">
                    {done} dari {relevant} pesanan selesai
                </p>
            </div>
        </Tile>
    );
}

/* Orders in vs completed, line chart with range */
type Range = '7H' | '30H' | '90H';

function TrendTile({ daily }: { daily: Day[] }) {
    const uid = useId().replace(/:/g, '');
    const mounted = useMounted();
    const [range, setRange] = useState<Range>('30H');
    const [hover, setHover] = useState<number | null>(null);
    const days = daily.slice(-{ '7H': 7, '30H': 30, '90H': 90 }[range]);
    const a = days.map((d) => d.masuk);
    const b = days.map((d) => d.selesai);
    const W = 640;
    const H = 220;
    const hi = Math.max(...a, ...b, 1);
    const y = (v: number) => H - 16 - (v / hi) * (H - 40);
    const pa = a.map((v, i) => [(i / (a.length - 1)) * W, y(v)] as const);
    const pb = b.map((v, i) => [(i / (b.length - 1)) * W, y(v)] as const);
    const la = smooth(pa);
    const idx = hover ?? a.length - 1;
    const left = `${(pa[idx][0] / W) * 100}%`;
    const sum = (arr: number[]) => arr.reduce((s, v) => s + v, 0);

    const onMove = (e: PointerEvent<HTMLDivElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        setHover(Math.max(0, Math.min(a.length - 1, Math.round(((e.clientX - r.left) / r.width) * (a.length - 1)))));
    };

    return (
        <Tile
            title="Pesanan masuk vs selesai"
            className="sm:col-span-2 lg:col-span-2 lg:row-span-2"
            action={<Pills label="Rentang" value={range} options={['7H', '30H', '90H']} onChange={setRange} />}
        >
            <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
                <div>
                    <p className="text-muted-foreground flex items-center gap-2 text-[12px]">
                        <span className="bg-brand h-[3px] w-4 rounded-full" aria-hidden />
                        Masuk
                    </p>
                    <p className="mt-1 font-mono text-[22px] font-semibold tabular-nums">{hover === null ? sum(a) : a[idx]}</p>
                </div>
                <div>
                    <p className="text-muted-foreground flex items-center gap-2 text-[12px]">
                        <span className="border-muted-foreground h-0 w-4 border-t-2 border-dashed" aria-hidden />
                        Selesai
                    </p>
                    <p className="text-muted-foreground mt-1 font-mono text-[22px] font-semibold tabular-nums">{hover === null ? sum(b) : b[idx]}</p>
                </div>
                <span className="bg-brand/15 text-brand ml-auto rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums">
                    {hover === null ? `${range.replace('H', ' hari')}` : dayLabel(days[idx].date)}
                </span>
            </div>

            <div className="relative mt-4 flex-1 touch-pan-y" style={{ minHeight: 220 }} onPointerMove={onMove} onPointerLeave={() => setHover(null)} role="img" aria-label={`${sum(a)} pesanan masuk dan ${sum(b)} selesai dalam ${range}`}>
                <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
                    <defs>
                        <linearGradient id={`${uid}-f`} x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0" style={{ stopColor: 'var(--brand)', stopOpacity: 0.28 }} />
                            <stop offset="1" style={{ stopColor: 'var(--brand)', stopOpacity: 0 }} />
                        </linearGradient>
                    </defs>
                    {[0.25, 0.5, 0.75].map((f) => (
                        <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} vectorEffect="non-scaling-stroke" strokeDasharray="1 5" style={{ stroke: 'var(--border)' }} />
                    ))}
                    <path d={`${la} L ${W} ${H} L 0 ${H} Z`} fill={`url(#${uid}-f)`} style={{ opacity: mounted ? 1 : 0, transition: 'opacity 900ms ease 400ms' }} />
                    <path d={smooth(pb)} fill="none" strokeWidth={1.5} strokeDasharray="4 5" vectorEffect="non-scaling-stroke" style={{ stroke: 'var(--muted-foreground)' }} />
                    <path
                        key={range}
                        d={la}
                        fill="none"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                        pathLength={1}
                        style={{ stroke: 'var(--brand)', strokeDasharray: 1, strokeDashoffset: mounted ? 0 : 1, transition: `stroke-dashoffset 1300ms ${EASE}` }}
                    />
                </svg>
                <span aria-hidden className="bg-border pointer-events-none absolute inset-y-0 w-px -translate-x-1/2" style={{ left, opacity: hover !== null ? 1 : 0 }} />
                <span aria-hidden className="border-card bg-brand pointer-events-none absolute size-3.5 -translate-1/2 rounded-full border-[3px]" style={{ left, top: `${(pa[idx][1] / H) * 100}%` }} />
                <span
                    aria-hidden
                    className="border-card bg-muted-foreground pointer-events-none absolute size-2.5 -translate-1/2 rounded-full border-2"
                    style={{ left, top: `${(pb[idx][1] / H) * 100}%`, opacity: hover !== null ? 1 : 0 }}
                />
            </div>
            <div className="text-muted-foreground mt-3 flex justify-between font-mono text-[11px]" aria-hidden>
                <span>{dayLabel(days[0].date)}</span>
                <span>{dayLabel(days[Math.floor(days.length / 2)].date)}</span>
                <span>Hari ini</span>
            </div>
        </Tile>
    );
}

/* Most ordered services: segmented bar */
function ServicesTile({ topServices }: { topServices: Props['topServices'] }) {
    const mounted = useMounted();
    const total = topServices.reduce((s, a) => s + a.value, 0);
    const [hover, setHover] = useState<number | null>(null);

    return (
        <Tile title="Layanan terpopuler · 90 hari">
            {total === 0 ? (
                <p className="text-muted-foreground text-sm">Belum ada pesanan.</p>
            ) : (
                <>
                    <p className="font-mono text-[22px] font-semibold tabular-nums">
                        {num.format(total)} <span className="text-muted-foreground text-sm">pesanan</span>
                    </p>
                    <div className="mt-4 flex h-9 gap-1" onPointerLeave={() => setHover(null)}>
                        {topServices.map((a, i) => (
                            <span
                                key={a.label}
                                onPointerEnter={() => setHover(i)}
                                className="rounded-[8px]"
                                style={{
                                    flexBasis: mounted ? `${(a.value / total) * 100}%` : `${100 / topServices.length}%`,
                                    background: serviceFill[i % serviceFill.length],
                                    opacity: hover === null || hover === i ? 1 : 0.3,
                                    transition: `flex-basis 1000ms ${EASE} ${200 + i * 60}ms, opacity 200ms ease`,
                                }}
                                aria-hidden
                            />
                        ))}
                    </div>
                    <ul className="mt-4 space-y-2">
                        {topServices.map((a, i) => (
                            <li key={a.label} className="flex items-center justify-between gap-2 text-[12px]" onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
                                <span className="flex min-w-0 items-center gap-2">
                                    <span className="size-2 shrink-0 rounded-full" style={{ background: serviceFill[i % serviceFill.length] }} aria-hidden />
                                    <span className="truncate">{a.label}</span>
                                </span>
                                <span className="text-muted-foreground font-mono tabular-nums">{((a.value / total) * 100).toFixed(0)}%</span>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </Tile>
    );
}

/* New orders: solid brand tile with a call to action */
function NewOrdersTile({ count, orders, daily }: { count: number; orders: Order[]; daily: Day[] }) {
    const last10 = daily.slice(-10).map((d) => d.masuk);
    const max = Math.max(...last10, 1);

    return (
        <section className="bg-brand relative flex min-w-0 flex-col overflow-hidden rounded-[26px] p-5 text-white lg:row-span-2">
            <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-white/15 blur-3xl" />
            <header className="relative flex items-center justify-between">
                <h3 className="text-[13px] font-semibold opacity-80">Pesanan baru</h3>
                <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-2 py-0.5 font-mono text-[11px] font-semibold">
                    <span className={`size-1.5 rounded-full bg-white ${count ? 'animate-pulse' : ''}`} aria-hidden />
                    {count ? 'Menunggu' : 'Aman'}
                </span>
            </header>

            <p className="relative mt-5 font-mono text-[52px] leading-none font-semibold tracking-[-0.05em] tabular-nums">{count}</p>
            <p className="relative mt-1 text-[12px] font-medium opacity-80">{count ? 'pesanan belum ditangani' : 'Semua pesanan sudah ditangani'}</p>

            <ul className="relative mt-5 space-y-2">
                {orders.map((o) => (
                    <li key={o.id} className="rounded-2xl bg-white/12 p-3">
                        <div className="flex items-baseline justify-between gap-2 text-[12px] font-semibold">
                            <span className="truncate">{o.name}</span>
                            <span className="shrink-0 font-mono text-[11px] opacity-75">{timeAgo(o.created_at)}</span>
                        </div>
                        <p className="mt-0.5 truncate text-[11px] opacity-80">
                            {o.service?.name ?? 'Lainnya'} · {o.device}
                        </p>
                    </li>
                ))}
            </ul>

            <div className="relative mt-auto pt-6">
                <div className="flex h-12 items-end gap-1" aria-hidden>
                    {last10.map((v, i) => (
                        <span key={i} className="flex-1 rounded-[4px] bg-white" style={{ height: `${10 + (v / max) * 90}%`, opacity: 0.2 + (i / last10.length) * 0.6 }} />
                    ))}
                </div>
                <p className="mt-1.5 font-mono text-[10px] opacity-70">Pesanan masuk 10 hari terakhir</p>

                <Link
                    href="/admin/orders?status=baru"
                    className="text-brand mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-semibold transition-transform active:scale-[0.98]"
                >
                    Tangani sekarang <ArrowRight className="size-4" />
                </Link>
            </div>
        </section>
    );
}

/* Website content shortcuts */
function ContentTile({ content }: { content: Props['content'] }) {
    const links = [
        { href: '/admin/services', icon: Wrench, label: 'Layanan aktif', value: content.services },
        { href: '/admin/showcases', icon: Images, label: 'Galeri hasil aktif', value: content.showcases },
        { href: '/admin/settings', icon: Palette, label: 'Tampilan situs', value: null },
    ];

    return (
        <Tile title="Konten website" action={<a href="/" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-brand"><ExternalLink className="size-4" /></a>}>
            <ul className="-mx-2 space-y-1">
                {links.map(({ href, icon: Icon, label, value }) => (
                    <li key={href}>
                        <Link href={href} className="hover:bg-muted/60 flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors">
                            <span className="bg-brand/10 text-brand grid size-9 shrink-0 place-items-center rounded-xl">
                                <Icon className="size-4" />
                            </span>
                            <span className="flex-1 text-[13px] font-medium">{label}</span>
                            {value !== null ? <span className="font-mono text-[15px] font-semibold tabular-nums">{value}</span> : <ArrowRight className="text-muted-foreground size-4" />}
                        </Link>
                    </li>
                ))}
            </ul>
        </Tile>
    );
}

/* Busiest weekdays */
function WeekdaysTile({ weekdays }: { weekdays: number[] }) {
    const mounted = useMounted();
    const max = Math.max(...weekdays, 1);
    const total = weekdays.reduce((s, v) => s + v, 0);
    const busiest = total ? weekdays.indexOf(Math.max(...weekdays)) : -1;

    return (
        <Tile title="Hari tersibuk · 90 hari" className="sm:col-span-2 lg:col-span-2">
            <div className="flex flex-1 items-end gap-3" style={{ minHeight: 110 }}>
                {weekdays.map((v, i) => (
                    <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                        <span className="text-muted-foreground font-mono text-[11px] tabular-nums">{v}</span>
                        <span
                            className={`w-full rounded-[6px] ${i === busiest ? 'bg-brand' : 'bg-muted-foreground'}`}
                            style={{
                                height: mounted ? `${8 + (v / max) * 80}%` : '4%',
                                opacity: i === busiest ? 1 : 0.15 + (v / max) * 0.4,
                                transition: `height 900ms ${EASE} ${i * 60}ms`,
                            }}
                        />
                        <span className={`text-[11px] font-medium ${i === busiest ? 'text-brand' : 'text-muted-foreground'}`}>{weekdayNames[i]}</span>
                    </div>
                ))}
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-3 border-t pt-3">
                {[
                    ['Total', num.format(total)],
                    ['Rata-rata / hari', (total / 90).toFixed(1)],
                    ['Paling ramai', busiest >= 0 ? weekdayNames[busiest] : '-'],
                ].map(([k, v]) => (
                    <div key={k} className="min-w-0">
                        <dt className="text-muted-foreground text-[11px]">{k}</dt>
                        <dd className="mt-0.5 font-mono text-[13px] font-semibold tabular-nums">{v}</dd>
                    </div>
                ))}
            </dl>
        </Tile>
    );
}

/* Latest orders */
function LatestTile({ orders }: { orders: Order[] }) {
    const mounted = useMounted();

    return (
        <Tile
            title="Pesanan terbaru"
            className="sm:col-span-2 lg:col-span-2"
            action={
                <Link href="/admin/orders" className="text-brand inline-flex items-center gap-1 text-[12px] font-medium hover:underline">
                    Semua <ArrowRight className="size-3.5" />
                </Link>
            }
        >
            {orders.length === 0 && <p className="text-muted-foreground text-sm">Belum ada pesanan.</p>}
            <ul className="-mx-2 -my-1">
                {orders.map((o, i) => (
                    <li
                        key={o.id}
                        className="hover:bg-muted/50 flex items-center gap-3 rounded-2xl px-2 py-2"
                        style={{
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'none' : 'translateY(6px)',
                            transition: `opacity 500ms ease ${300 + i * 70}ms, transform 500ms ${EASE} ${300 + i * 70}ms, background-color 150ms`,
                        }}
                    >
                        <span className="bg-muted grid size-9 shrink-0 place-items-center rounded-xl text-[11px] font-bold uppercase">{o.name.slice(0, 2)}</span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium">
                                {o.name} · {o.device}
                            </p>
                            <p className="text-muted-foreground truncate text-[11px]">
                                {o.service?.name ?? 'Lainnya'} · {timeAgo(o.created_at)}
                            </p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusColors[o.status]}`}>{statusLabels[o.status]}</span>
                    </li>
                ))}
            </ul>
        </Tile>
    );
}

export default function Dashboard({ daily, counts, topServices, weekdays, newOrders, latest, content }: Props) {
    const { auth, settings } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="mx-auto w-full max-w-[1200px] p-4">
                <nav className="mb-3 flex flex-wrap items-center justify-end gap-2 px-1" aria-label="Dashboard">
                    <a href="/" target="_blank" rel="noreferrer" className="hover:border-brand flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-medium transition">
                        <span className="bg-brand size-2 rounded-full" aria-hidden />
                        {settings.site_name}
                        <ExternalLink className="size-3" />
                    </a>
                    <span className="bg-foreground text-background rounded-full px-3 py-1.5 font-mono text-[12px] font-semibold">{auth.user.name}</span>
                </nav>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <HeroTile name={auth.user.name} daily={daily} />
                    <StatusTile counts={counts} />
                    <CompletionTile counts={counts} />
                    <TrendTile daily={daily} />
                    <ServicesTile topServices={topServices} />
                    <NewOrdersTile count={counts.baru ?? 0} orders={newOrders} daily={daily} />
                    <ContentTile content={content} />
                    <WeekdaysTile weekdays={weekdays} />
                    <LatestTile orders={latest} />
                </div>
            </div>
        </AppLayout>
    );
}
