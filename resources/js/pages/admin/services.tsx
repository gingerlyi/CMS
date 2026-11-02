import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Service } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Layanan', href: '/admin/services' }];
const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

type ServiceForm = {
    name: string;
    category: string;
    description: string;
    price_from: number;
    is_active: boolean;
    sort_order: number;
    image: File | null;
};

export default function Services({ services }: { services: Service[] }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Service | null>(null);
    const { data, setData, post, processing, errors, reset, clearErrors, transform } = useForm<ServiceForm>({
        name: '',
        category: '',
        description: '',
        price_from: 0,
        is_active: true,
        sort_order: 0,
        image: null,
    });

    const openForm = (service: Service | null) => {
        clearErrors();
        setEditing(service);
        setData(
            service
                ? { ...service, description: service.description ?? '', image: null }
                : { name: '', category: '', description: '', price_from: 0, is_active: true, sort_order: services.length, image: null },
        );
        setOpen(true);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // File uploads must go through POST; Laravel reads _method to route it as PUT.
        transform((d) => (editing ? { ...d, _method: 'put' } : d));
        post(editing ? route('admin.services.update', editing.id) : route('admin.services.store'), {
            forceFormData: true,
            onSuccess: () => {
                setOpen(false);
                reset();
            },
        });
    };

    const destroy = (service: Service) => {
        if (confirm(`Hapus layanan "${service.name}"?`)) router.delete(route('admin.services.destroy', service.id), { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Layanan" />
            <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <Heading title="Layanan" description="Kelola katalog layanan yang tampil di website." />
                    <Button onClick={() => openForm(null)}>
                        <Plus /> Tambah
                    </Button>
                </div>

                <div className="bg-card overflow-x-auto rounded-xl border shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-muted-foreground text-left">
                            <tr>
                                <th className="p-3">Layanan</th>
                                <th className="p-3">Kategori</th>
                                <th className="p-3">Mulai dari</th>
                                <th className="p-3">Status</th>
                                <th className="p-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {services.map((s) => (
                                <tr key={s.id}>
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            {s.image_url ? <img src={s.image_url} alt="" className="size-10 rounded-md object-cover" /> : <div className="bg-muted size-10 rounded-md" />}
                                            <span className="font-medium">{s.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-3">{s.category}</td>
                                    <td className="p-3">{rupiah.format(s.price_from)}</td>
                                    <td className="p-3">
                                        <Badge variant={s.is_active ? 'default' : 'secondary'}>{s.is_active ? 'Aktif' : 'Disembunyikan'}</Badge>
                                    </td>
                                    <td className="p-3 text-right whitespace-nowrap">
                                        <Button variant="ghost" size="icon" onClick={() => openForm(s)} aria-label="Edit">
                                            <Pencil />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => destroy(s)} aria-label="Hapus">
                                            <Trash2 className="text-destructive" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {services.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-muted-foreground p-6 text-center">
                                        Belum ada layanan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <form onSubmit={submit} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>{editing ? 'Edit layanan' : 'Tambah layanan'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama</Label>
                            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                            <InputError message={errors.name} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="category">Kategori</Label>
                                <Input
                                    id="category"
                                    list="categories"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    required
                                />
                                <datalist id="categories">
                                    {[...new Set(services.map((s) => s.category))].map((c) => (
                                        <option key={c} value={c} />
                                    ))}
                                </datalist>
                                <InputError message={errors.category} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="price_from">Harga mulai (Rp)</Label>
                                <Input
                                    id="price_from"
                                    type="number"
                                    min={0}
                                    value={data.price_from}
                                    onChange={(e) => setData('price_from', Number(e.target.value))}
                                    required
                                />
                                <InputError message={errors.price_from} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <textarea
                                id="description"
                                className="border-input focus-visible:ring-ring/50 min-h-24 rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            <InputError message={errors.description} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="image">Gambar (opsional)</Label>
                                <Input id="image" type="file" accept="image/*" onChange={(e) => setData('image', e.target.files?.[0] ?? null)} />
                                <InputError message={errors.image} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="sort_order">Urutan</Label>
                                <Input id="sort_order" type="number" min={0} value={data.sort_order} onChange={(e) => setData('sort_order', Number(e.target.value))} />
                            </div>
                        </div>
                        <Label className="flex items-center gap-2">
                            <Checkbox checked={data.is_active} onCheckedChange={(v) => setData('is_active', v === true)} />
                            Tampilkan di website
                        </Label>
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                                Batal
                            </Button>
                            <Button disabled={processing}>Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
