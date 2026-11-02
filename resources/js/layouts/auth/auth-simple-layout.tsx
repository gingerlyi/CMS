import { Card } from '@/components/ui/card';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ClipboardList, Images, Wrench } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

// Card layout adapted from the sign-in-6 design (21st.dev), using the brand colors from the admin settings.
export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    const { settings } = usePage<SharedData>().props;
    const logo = settings.logo_url ? (
        <img src={settings.logo_url} alt="" className="size-full object-contain" />
    ) : (
        <Wrench className="size-4" />
    );

    return (
        <div className="bg-muted/40 relative flex min-h-svh w-full items-center justify-center overflow-hidden p-6">
            <div aria-hidden className="bg-brand/15 pointer-events-none absolute -top-40 -left-40 size-[32rem] rounded-full blur-3xl" />
            <div aria-hidden className="bg-brand-2/15 pointer-events-none absolute -right-40 -bottom-40 size-[32rem] rounded-full blur-3xl" />

            <div className="relative w-full max-w-3xl">
                <Card className="grid w-full gap-0 overflow-hidden p-0 shadow-xl md:grid-cols-2">
                    <div className="from-brand to-brand-2 relative hidden flex-col justify-between overflow-hidden bg-gradient-to-b p-10 text-white md:flex">
                        <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-white/10 blur-3xl" />

                        <Link href={route('home')} className="relative flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-white p-1 ring-1 ring-white/25">{logo}</div>
                            <span className="text-sm font-semibold tracking-tight">{settings.site_name}</span>
                        </Link>

                        <h2 className="relative mt-auto max-w-[15ch] pt-16 text-[26px] leading-[1.15] font-semibold tracking-tight text-balance">
                            Kelola bisnis servis Anda dari satu tempat.
                        </h2>

                        <div className="relative mt-8 flex items-center gap-3">
                            <div className="flex -space-x-2.5">
                                {[Wrench, ClipboardList, Images].map((Icon, i) => (
                                    <span key={i} className="text-brand grid size-7 place-items-center rounded-full bg-white ring-2 ring-white/40">
                                        <Icon className="size-3.5" />
                                    </span>
                                ))}
                            </div>
                            <span className="text-xs text-white/85">Layanan, pesanan & galeri hasil</span>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center gap-5 p-8">
                        <Link href={route('home')} className="flex items-center gap-2.5 md:hidden">
                            <div className="size-9">{logo}</div>
                            <span className="text-sm font-semibold tracking-tight">{settings.site_name}</span>
                        </Link>

                        <div className="flex flex-col gap-1">
                            <span className="text-lg font-semibold">{title}</span>
                            <span className="text-muted-foreground text-xs">{description}</span>
                        </div>

                        {children}
                    </div>
                </Card>

                <Link href={route('home')} className="text-muted-foreground hover:text-foreground mt-6 inline-flex items-center gap-1.5 text-xs transition">
                    <ArrowLeft className="size-3.5" /> Kembali ke website
                </Link>
            </div>
        </div>
    );
}
