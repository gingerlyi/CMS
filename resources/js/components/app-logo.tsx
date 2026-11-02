import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Wrench } from 'lucide-react';

export default function AppLogo() {
    const { settings } = usePage<SharedData>().props;

    return (
        <>
            {settings.logo_url ? (
                <img src={settings.logo_url} alt="" className="size-8 shrink-0 object-contain" />
            ) : (
                <div className="from-brand to-brand-2 flex aspect-square size-8 items-center justify-center rounded-md bg-gradient-to-br text-white">
                    <Wrench className="size-4" />
                </div>
            )}
            <div className="ml-1 grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold">{settings.site_name}</span>
                <span className="text-muted-foreground truncate text-xs">Panel Admin</span>
            </div>
        </>
    );
}
