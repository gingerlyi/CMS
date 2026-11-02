import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { statusColors, statusLabels } from '@/lib/order-status';
import { type BreadcrumbItem, type Order, type OrderStatus } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { MessageCircle, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Pesanan', href: '/admin/orders' }];

type Paginated<T> = { data: T[]; links: { url: string | null; label: string; active: boolean }[] };

export default function Orders({ orders, status }: { orders: Paginated<Order>; status: OrderStatus | null }) {
    const update = (order: Order, status: string) => router.put(route('admin.orders.update', order.id), { status }, { preserveScroll: true });
    const destroy = (order: Order) => {
        if (confirm(`Hapus pesanan #${order.id}?`)) router.delete(route('admin.orders.destroy', order.id), { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pesanan" />
            <div className="p-4">
                <Heading title="Pesanan" description="Pesanan masuk dari form di website." />

                <div className="mb-4 flex flex-wrap gap-2">
                    {[null, ...(Object.keys(statusLabels) as OrderStatus[])].map((s) => (
                        <Link
                            key={s ?? 'all'}
                            href={route('admin.orders.index', s ? { status: s } : {})}
                            className={`rounded-full px-4 py-1.5 text-sm transition ${s === status ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/70'}`}
                        >
                            {s ? statusLabels[s] : 'Semua'}
                        </Link>
                    ))}
                </div>

                <div className="bg-card overflow-x-auto rounded-xl border shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-muted-foreground text-left">
                            <tr>
                                <th className="p-3">#</th>
                                <th className="p-3">Pelanggan</th>
                                <th className="p-3">Layanan / Alat</th>
                                <th className="p-3">Keluhan</th>
                                <th className="p-3">Status</th>
                                <th className="p-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders.data.map((o) => (
                                <tr key={o.id} className="align-top">
                                    <td className="p-3">
                                        {o.id}
                                        <div className="text-muted-foreground text-xs">{new Date(o.created_at).toLocaleDateString('id-ID')}</div>
                                    </td>
                                    <td className="p-3">
                                        <div className="font-medium">{o.name}</div>
                                        <div className="text-muted-foreground">{o.phone}</div>
                                    </td>
                                    <td className="p-3">
                                        <div>{o.service?.name ?? 'Lainnya'}</div>
                                        <div className="text-muted-foreground">{o.device}</div>
                                    </td>
                                    <td className="max-w-xs p-3 whitespace-pre-line">{o.complaint}</td>
                                    <td className="p-3">
                                        <select
                                            value={o.status}
                                            onChange={(e) => update(o, e.target.value)}
                                            className={`rounded-full border-0 px-3 py-1 text-xs font-medium ${statusColors[o.status]}`}
                                        >
                                            {(Object.keys(statusLabels) as OrderStatus[]).map((s) => (
                                                <option key={s} value={s}>
                                                    {statusLabels[s]}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-3 text-right whitespace-nowrap">
                                        <Button variant="ghost" size="icon" asChild aria-label="Chat WhatsApp">
                                            <a href={`https://wa.me/${o.phone.replace(/\D/g, '').replace(/^0/, '62')}`} target="_blank" rel="noreferrer">
                                                <MessageCircle />
                                            </a>
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => destroy(o)} aria-label="Hapus">
                                            <Trash2 className="text-destructive" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {orders.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-muted-foreground p-6 text-center">
                                        Belum ada pesanan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {orders.links.length > 3 && (
                    <div className="mt-4 flex flex-wrap gap-1">
                        {orders.links.map((l, i) =>
                            l.url ? (
                                <Link
                                    key={i}
                                    href={l.url}
                                    preserveScroll
                                    className={`rounded-md px-3 py-1.5 text-sm ${l.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                    dangerouslySetInnerHTML={{ __html: l.label }}
                                />
                            ) : (
                                <span key={i} className="text-muted-foreground px-3 py-1.5 text-sm" dangerouslySetInnerHTML={{ __html: l.label }} />
                            ),
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
