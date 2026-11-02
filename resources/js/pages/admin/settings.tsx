import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Wrench } from 'lucide-react';
import { FormEventHandler, useMemo, type ReactNode } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Tampilan Situs', href: '/admin/settings' }];

const textareaClass =
    'border-input focus-visible:ring-ring/50 min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]';

// Landing page texts, grouped in the order the sections appear on the page. [key, label, multiline]
const contentGroups: { title: string; description?: string; fields: [string, string, boolean?][] }[] = [
    {
        title: 'Pita berjalan',
        description: 'Teks merah berjalan di bawah hero. Pisahkan dengan koma; kategori layanan ikut ditampilkan otomatis.',
        fields: [['marquee', 'Isi pita']],
    },
    {
        title: 'Lorong foto 3D',
        description: 'Foto diambil otomatis dari Galeri Hasil, gambar "Kenali kami" dan foto layanan.',
        fields: [
            ['tunnel_label', 'Label kecil'],
            ['tunnel_title', 'Judul'],
            ['tunnel_text', 'Keterangan', true],
        ],
    },
    {
        title: 'Hasil Perbaikan (carousel 3D)',
        description: 'Isi kartunya diatur di menu Galeri Hasil.',
        fields: [
            ['showcase_label', 'Label kecil'],
            ['showcase_title', 'Judul'],
        ],
    },
    {
        title: 'Katalog Layanan',
        fields: [
            ['services_label', 'Label kecil'],
            ['services_title', 'Judul'],
        ],
    },
    {
        title: 'Cara Kerja',
        fields: [
            ['steps_label', 'Label kecil'],
            ['steps_title', 'Judul'],
            ['step1_title', 'Langkah 1 — judul'],
            ['step1_text', 'Langkah 1 — keterangan', true],
            ['step2_title', 'Langkah 2 — judul'],
            ['step2_text', 'Langkah 2 — keterangan', true],
            ['step3_title', 'Langkah 3 — judul'],
            ['step3_text', 'Langkah 3 — keterangan', true],
        ],
    },
    {
        title: 'Form Pesan',
        fields: [
            ['order_label', 'Label kecil'],
            ['order_title', 'Judul'],
            ['order_text', 'Keterangan', true],
        ],
    },
];

// The logo never shows above 96px, so a big upload would only slow every page down. Anything the browser can't decode goes up as is.
async function shrinkLogo(file: File, size = 256) {
    try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, size / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.9));
        return blob && blob.size < file.size ? new File([blob], `logo.${blob.type.split('/')[1]}`, { type: blob.type }) : file;
    } catch {
        return file;
    }
}

// Pulls "lat, lng" out of a pasted Google Maps URL; plain coordinates pass through unchanged.
// The place pin (!3d…!4d…) wins over the viewport centre (@lat,lng).
function coordsFromText(text: string) {
    const m =
        text.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) ??
        text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ??
        text.match(/[?&](?:q|query|ll|destination)=(-?\d+\.\d+)(?:,|%2C)\s*(-?\d+\.\d+)/);
    return m ? `${m[1]}, ${m[2]}` : text;
}

function Group({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
    return (
        <section className="bg-card space-y-4 rounded-xl border p-5 shadow-sm">
            <div>
                <h3 className="font-semibold">{title}</h3>
                {description && <p className="text-muted-foreground text-sm">{description}</p>}
            </div>
            {children}
        </section>
    );
}

export default function SiteSettings() {
    const { settings } = usePage<SharedData>().props;
    const { data, setData, post, transform, processing, errors, recentlySuccessful } = useForm({
        site_name: settings.site_name,
        whatsapp: settings.whatsapp ?? '',
        address: settings.address ?? '',
        hero_title: settings.hero_title,
        hero_subtitle: settings.hero_subtitle ?? '',
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        content: settings.content,
        // "lat, lng" as copied from Google Maps; split into latitude/longitude on submit.
        coords: settings.latitude !== null ? `${settings.latitude}, ${settings.longitude}` : '',
        logo: null as File | null,
        scroll_image: null as File | null,
    });
    const fieldErrors = errors as Record<string, string>;
    const [lat, lng] = data.coords.split(',').map((v) => v.trim());
    const validCoords =
        Math.abs(Number(lat)) <= 90 &&
        Math.abs(Number(lng)) <= 180 &&
        lat !== '' &&
        lng !== undefined &&
        lng !== '' &&
        !isNaN(Number(lat)) &&
        !isNaN(Number(lng));

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        transform(({ coords, ...d }) => ({ ...d, latitude: coords.trim() ? lat : null, longitude: coords.trim() ? (lng ?? '') : null }));
        post(route('admin.settings.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setData((d) => ({ ...d, logo: null, scroll_image: null })),
        });
    };

    const setContent = (key: string, value: string) => setData('content', { ...data.content, [key]: value });
    const logoPreview = useMemo(() => (data.logo ? URL.createObjectURL(data.logo) : settings.logo_url), [data.logo, settings.logo_url]);
    const scrollPreview = useMemo(
        () => (data.scroll_image ? URL.createObjectURL(data.scroll_image) : settings.scroll_image_url),
        [data.scroll_image, settings.scroll_image_url],
    );

    const text = (key: 'site_name' | 'whatsapp' | 'address' | 'hero_title', label: string) => (
        <div className="grid gap-2">
            <Label htmlFor={key}>{label}</Label>
            <Input id={key} value={data[key]} onChange={(e) => setData(key, e.target.value)} />
            <InputError message={errors[key]} />
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tampilan Situs" />
            <form onSubmit={submit} className="grid gap-6 p-4 lg:grid-cols-[1fr_320px]">
                <div className="max-w-2xl space-y-6">
                    <Heading
                        title="Tampilan Situs"
                        description="Semua teks, gambar dan warna di landing page. Kosongkan kolom teks untuk kembali ke teks bawaan."
                    />

                    <Group title="Identitas & kontak">
                        <div className="grid gap-2">
                            <Label htmlFor="logo">Logo</Label>
                            <Input
                                id="logo"
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    setData('logo', file ? await shrinkLogo(file) : null);
                                }}
                            />
                            <InputError message={errors.logo} />
                        </div>
                        {text('site_name', 'Nama usaha')}
                        <div className="grid grid-cols-2 gap-4">
                            {(['primary_color', 'secondary_color'] as const).map((key) => (
                                <div key={key} className="grid gap-2">
                                    <Label htmlFor={key}>{key === 'primary_color' ? 'Warna utama' : 'Warna kedua'}</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            id={key}
                                            type="color"
                                            value={data[key]}
                                            onChange={(e) => setData(key, e.target.value)}
                                            className="h-9 w-14 shrink-0 cursor-pointer rounded-md border bg-transparent"
                                        />
                                        <Input value={data[key]} onChange={(e) => setData(key, e.target.value)} className="font-mono" />
                                    </div>
                                    <InputError message={errors[key]} />
                                </div>
                            ))}
                        </div>
                        {text('whatsapp', 'Nomor WhatsApp (format 628xxx)')}
                        {text('address', 'Alamat')}
                    </Group>

                    <Group title="Hero" description="Bagian paling atas dengan animasi kerumunan.">
                        {text('hero_title', 'Judul')}
                        <div className="grid gap-2">
                            <Label htmlFor="hero_subtitle">Subjudul</Label>
                            <textarea
                                id="hero_subtitle"
                                className={textareaClass}
                                value={data.hero_subtitle}
                                onChange={(e) => setData('hero_subtitle', e.target.value)}
                            />
                            <InputError message={errors.hero_subtitle} />
                        </div>
                    </Group>

                    <Group
                        title="Kenali kami (gambar dalam bingkai 3D)"
                        description="Section dengan gambar yang tegak saat di-scroll. Gambar lebar (landscape) paling pas."
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="scroll_image">Gambar</Label>
                            <img src={scrollPreview} alt="" className="aspect-video w-full rounded-lg border object-cover" />
                            <Input
                                id="scroll_image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('scroll_image', e.target.files?.[0] ?? null)}
                            />
                            <InputError message={errors.scroll_image} />
                        </div>
                        {(
                            [
                                ['scroll_label', 'Label kecil'],
                                ['scroll_title', 'Judul'],
                            ] as const
                        ).map(([key, label]) => (
                            <div key={key} className="grid gap-2">
                                <Label htmlFor={key}>{label}</Label>
                                <Input id={key} value={data.content[key] ?? ''} onChange={(e) => setContent(key, e.target.value)} />
                                <InputError message={fieldErrors[`content.${key}`]} />
                            </div>
                        ))}
                    </Group>

                    <Group
                        title="Lokasi (globe)"
                        description="Titik merah di globe dan peta detailnya. Kosongkan koordinat untuk menyembunyikan section ini."
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="coords">Koordinat atau link Google Maps</Label>
                            <Input
                                id="coords"
                                value={data.coords}
                                onChange={(e) => setData('coords', coordsFromText(e.target.value))}
                                placeholder="-6.1753924, 106.8271528"
                                className="font-mono"
                            />
                            <p className="text-muted-foreground text-xs">
                                Cara 1: di Google Maps klik kanan titik bengkel, klik angka koordinat paling atas, lalu tempel di sini. Cara 2: buka
                                tempatnya di Google Maps, salin link dari address bar browser dan tempel; koordinatnya diambil otomatis. (Link pendek
                                maps.app.goo.gl dari tombol Bagikan belum bisa dibaca.)
                            </p>
                            <InputError message={fieldErrors.latitude ?? fieldErrors.longitude} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="map_zoom">Zoom peta detail</Label>
                            <select
                                id="map_zoom"
                                value={data.content.map_zoom}
                                onChange={(e) => setContent('map_zoom', e.target.value)}
                                className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                            >
                                {[
                                    [12, 'Kota'],
                                    [14, 'Kecamatan'],
                                    [16, 'Jalan (disarankan)'],
                                    [17, 'Gang'],
                                    [18, 'Bangunan'],
                                    [19, 'Sangat dekat'],
                                ].map(([z, name]) => (
                                    <option key={z} value={z}>
                                        {z} — {name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {validCoords ? (
                            <div className="grid gap-2">
                                <span className="text-sm font-medium">Pratinjau (seperti yang terbuka di website)</span>
                                <iframe
                                    title="Pratinjau lokasi"
                                    src={`https://maps.google.com/maps?q=${lat},${lng}&z=${data.content.map_zoom}&output=embed`}
                                    className="aspect-video w-full rounded-lg border"
                                    loading="lazy"
                                />
                            </div>
                        ) : (
                            data.coords.trim() && <p className="text-destructive text-xs">Format belum benar. Contoh: -6.1753924, 106.8271528</p>
                        )}
                        {(
                            [
                                ['location_label', 'Label kecil', false],
                                ['location_title', 'Judul', false],
                                ['location_text', 'Keterangan', true],
                            ] as const
                        ).map(([key, label, multiline]) => (
                            <div key={key} className="grid gap-2">
                                <Label htmlFor={key}>{label}</Label>
                                {multiline ? (
                                    <textarea
                                        id={key}
                                        className={textareaClass}
                                        value={data.content[key] ?? ''}
                                        onChange={(e) => setContent(key, e.target.value)}
                                    />
                                ) : (
                                    <Input id={key} value={data.content[key] ?? ''} onChange={(e) => setContent(key, e.target.value)} />
                                )}
                                <InputError message={fieldErrors[`content.${key}`]} />
                            </div>
                        ))}
                    </Group>

                    {contentGroups.map((group) => (
                        <Group key={group.title} title={group.title} description={group.description}>
                            {group.fields.map(([key, label, multiline]) => (
                                <div key={key} className="grid gap-2">
                                    <Label htmlFor={key}>{label}</Label>
                                    {multiline ? (
                                        <textarea
                                            id={key}
                                            className={textareaClass}
                                            value={data.content[key] ?? ''}
                                            onChange={(e) => setContent(key, e.target.value)}
                                        />
                                    ) : (
                                        <Input id={key} value={data.content[key] ?? ''} onChange={(e) => setContent(key, e.target.value)} />
                                    )}
                                    <InputError message={fieldErrors[`content.${key}`]} />
                                </div>
                            ))}
                        </Group>
                    ))}
                </div>

                <aside className="h-fit space-y-3 lg:sticky lg:top-4">
                    <span className="text-muted-foreground text-sm">Pratinjau hero</span>
                    <div className="overflow-hidden rounded-2xl border bg-white p-6 text-center text-neutral-900">
                        <div className="mx-auto mb-4 size-14">
                            {logoPreview ? (
                                <img src={logoPreview} alt="" className="size-full object-contain" />
                            ) : (
                                <span
                                    className="grid size-full place-items-center rounded-xl text-white"
                                    style={{ background: `linear-gradient(135deg, ${data.primary_color}, ${data.secondary_color})` }}
                                >
                                    <Wrench className="size-7" />
                                </span>
                            )}
                        </div>
                        <p
                            className="bg-clip-text text-2xl font-extrabold text-transparent"
                            style={{ backgroundImage: `linear-gradient(90deg, ${data.primary_color}, ${data.secondary_color})` }}
                        >
                            {data.hero_title}
                        </p>
                        <p className="mt-2 text-sm text-neutral-600">{data.hero_subtitle}</p>
                        <span
                            className="mt-4 inline-block rounded-full px-5 py-2 text-sm font-semibold text-white"
                            style={{ background: `linear-gradient(90deg, ${data.primary_color}, ${data.secondary_color})` }}
                        >
                            Read more
                        </span>
                    </div>

                    <div className="bg-card flex items-center gap-4 rounded-xl border p-4 shadow-sm">
                        <Button disabled={processing} className="flex-1">
                            Simpan semua perubahan
                        </Button>
                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-muted-foreground text-sm">Tersimpan</p>
                        </Transition>
                    </div>
                    <a href="/" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-brand block text-center text-sm">
                        Lihat hasilnya di website ↗
                    </a>
                </aside>
            </form>
        </AppLayout>
    );
}
