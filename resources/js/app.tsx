import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';
import { type SharedData } from './types';

declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: 'var(--brand)',
    },
});

// Brand colors start from app.blade.php; keep them in sync after admin edits them without a full reload.
router.on('success', (event) => {
    const { settings } = event.detail.page.props as unknown as SharedData;
    document.documentElement.style.setProperty('--brand', settings.primary_color);
    document.documentElement.style.setProperty('--brand-2', settings.secondary_color);
});

// This will set light / dark mode on load...
initializeTheme();
