import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SiteSettings {
    site_name: string;
    tagline: string | null;
    logo_url: string | null;
    primary_color: string;
    secondary_color: string;
    whatsapp: string | null;
    address: string | null;
    hero_title: string;
    hero_subtitle: string | null;
    scroll_image_url: string;
    latitude: number | null;
    longitude: number | null;
    /** Landing page texts keyed like SiteSetting::CONTENT_DEFAULTS. */
    content: Record<string, string>;
}

export interface Service {
    id: number;
    name: string;
    category: string;
    description: string | null;
    price_from: number;
    image_url: string | null;
    is_active: boolean;
    sort_order: number;
}

export interface Showcase {
    id: number;
    tag: string | null;
    title: string;
    subtitle: string | null;
    description: string | null;
    image_url: string | null;
    is_active: boolean;
    sort_order: number;
}

export type OrderStatus = 'baru' | 'diproses' | 'selesai' | 'batal';

export interface Order {
    id: number;
    name: string;
    phone: string;
    device: string;
    complaint: string;
    status: OrderStatus;
    created_at: string;
    service: { id: number; name: string } | null;
}

export interface SharedData {
    name: string;
    settings: SiteSettings;
    flash: { wa_url: string | null };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
