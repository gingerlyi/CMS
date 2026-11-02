import { type OrderStatus } from '@/types';

export const statusLabels: Record<OrderStatus, string> = { baru: 'Baru', diproses: 'Diproses', selesai: 'Selesai', batal: 'Batal' };
export const statusColors: Record<OrderStatus, string> = {
    baru: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    diproses: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    selesai: 'bg-green-500/15 text-green-600 dark:text-green-400',
    batal: 'bg-neutral-500/15 text-neutral-500',
};
