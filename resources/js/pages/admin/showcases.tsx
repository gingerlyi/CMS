import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Showcase } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Galeri Hasil', href: '/admin/showcases' }];

type ShowcaseForm = {
    tag: string;
    title: string;
    subtitle: string;
    description: string;
    is_active: boolean;
    sort_order: number;
    image: File | null;
};

export default function Showcases({ showcases }: { showcases: Showcase[] }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Showcase | null>(null);
    const { data, setData, post, processing, errors, reset, clearErrors, transform } = useForm<ShowcaseForm>({
        tag: '',
        title: '',
        subtitle: '',
        description: '',
        is_active: true,
        sort_order: 0,
        image: null,
    });

    const openForm = (showcase: Showcase | null) => {
        clearErrors();
        setEditing(showcase);
        setData(
            showcase
                ? {
                      tag: showcase.tag ?? '',
                      title: showcase.title,
                      subtitle: showcase.subtitle ?? '',
                      description: showcase.description ?? '',
                      is_active: showcase.is_active,
                      sort_order: showcase.sort_order,
                      image: null,
                  }
                : { tag: '', title: '', subtitle: '', description: '', is_active: true, sort_order: showcases.length, image: null },
        );
        setOpen(true);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // File uploads must go through POST; Laravel reads _method to route it as PUT.
        transform((d) => (editing ? { ...d, _method: 'put' } : d));
        post(editing ? route('admin.showcases.update', editing.id) : route('admin.showcases.store'), {
            forceFormData: true,
            onSuccess: () => {
                setOpen(false);
                reset();
            },
        });
    };

    const destroy = (showcase: Showcase) => {
        if (confirm(`Hapus "${showcase.title}"?`)) router.delete(route('admin.showcases.destroy', showcase.id), { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Galeri Hasil" />
            <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <Heading title="Galeri Hasil" description="Foto hasil perbaikan yang tampil di carousel 3D website. Foto potret (tegak) paling pas." />
                    <Button onClick={() => openForm(null)}>
                        <Plus /> Tambah
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {showcases.map((s) => (
                        <div key={s.id} className="bg-card overflow-hidden rounded-xl border shadow-sm transition hover:shadow-md">
                            {s.image_url ? (
                                <img src={s.image_url} alt="" className="aspect-[3/4] w-full object-cover" />
                            ) : (
                                <div className="bg-muted text-muted-foreground grid aspect-[3/4] place-items-center text-sm">Belum ada foto</div>
                            )}
                            <div className="space-y-1 p-3">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-muted-foreground text-xs">{s.tag}</span>
                                    <Badge variant={s.is_active ? 'default' : 'secondary'}>{s.is_active ? 'Aktif' : 'Disembunyikan'}</Badge>
                                </div>
                                <p className="font-semibold">{s.title}</p>
                                <p className="text-muted-foreground text-sm">{s.subtitle}</p>
                                <div className="flex justify-end">
                                    <Button variant="ghost" size="icon" onClick={() => openForm(s)} aria-label="Edit">
                                        <Pencil />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => destroy(s)} aria-label="Hapus">
                                        <Trash2 className="text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {showcases.length === 0 && <p className="text-muted-foreground p-6 text-center text-sm">Belum ada item. Section carousel disembunyikan sampai ada item aktif.</p>}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <form onSubmit={submit} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>{editing ? 'Edit hasil perbaikan' : 'Tambah hasil perbaikan'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Judul</Label>
                                <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} required placeholder="TV LED 43 Inci" />
                                <InputError message={errors.title} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="tag">Tag</Label>
                                <Input id="tag" value={data.tag} onChange={(e) => setData('tag', e.target.value)} placeholder="#ServisTV" />
                                <InputError message={errors.tag} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="subtitle">Subjudul</Label>
                            <Input id="subtitle" value={data.subtitle} onChange={(e) => setData('subtitle', e.target.value)} placeholder="Mati total jadi normal" />
                            <InputError message={errors.subtitle} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Keterangan</Label>
                            <textarea
                                id="description"
                                className="border-input focus-visible:ring-ring/50 min-h-20 rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            <InputError message={errors.description} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="image">Foto</Label>
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
