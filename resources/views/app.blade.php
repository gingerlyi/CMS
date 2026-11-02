<!DOCTYPE html>
@php($site = \App\Models\SiteSetting::current())
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" style="--brand: {{ $site->primary_color }}; --brand-2: {{ $site->secondary_color }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <link rel="icon" href="{{ $site->logo_url ?? '/favicon.ico' }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        {{-- Loaded without blocking the first paint; the page shows in a system font until it arrives. --}}
        <link href="https://fonts.bunny.net/css?family=plus-jakarta-sans:400,500,600,700,800|jetbrains-mono:500,600&display=swap" rel="stylesheet" media="print" onload="this.media='all'" />

        @if (request()->routeIs('home') && $site->logo_url)
            {{-- Logo on the brand colour from the very first paint, until React mounts and the intro takes over. --}}
            <link rel="preload" as="image" href="{{ $site->logo_url }}" fetchpriority="high">
            <style>
                #app:empty { position: fixed; inset: 0; background: var(--brand-2); }
                #app:empty::before { content: ''; position: absolute; top: 50%; left: 50%; width: 112px; height: 112px; transform: translate(-50%, -50%); border-radius: 24px; background: #fff url('{{ $site->logo_url }}') center / 80px no-repeat; }
            </style>
        @endif

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
