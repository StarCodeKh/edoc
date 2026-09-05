<!DOCTYPE html>
<html lang="en" class="light scroll-smooth " dir="ltr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <meta content="eDoc" name="description" />
    <meta name="website" content="https://edoc.cgmc.gov.kh" />
    <meta name="email" content="info@edoc.com" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="shortcut icon" href="/favicon.png">

    {{--
        The error pages are served outside the Vite/Inertia bundle, and the
        stylesheet above is the legacy theme sheet - it carries none of the
        utility classes the app itself relies on. Everything these pages need
        is therefore defined here, in the brand palette taken from the CGMC
        seal in public/images/logo.png - green #00944b with its gold accent -
        so an error page never renders half-styled or off-brand.
    --}}
    <style>
        :root {
            --brand: #00944b;
            --brand-dark: #007339;
            --brand-light: #34b371;
            --gold: #c99a2e;
            --gold-soft: #e0b653;
            --ink: #2f3d36;
            --ink-soft: #6b7a72;
            --surface: #ffffff;
            --surface-tint: #f1faf5;
            --line: #dcebe3;
        }

        *, *::before, *::after { box-sizing: border-box; }

        body.error-body {
            margin: 0;
            min-height: 100vh;
            background: var(--surface);
            color: var(--ink);
            font-family: 'Cerebri Sans', 'Nunito', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
            -webkit-font-smoothing: antialiased;
        }

        .error-page {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem 1.25rem;
            text-align: center;
        }

        .error-art {
            height: 13rem;
            max-width: 100%;
            margin: 0 auto 1.75rem;
            display: block;
            animation: error-float 4s ease-in-out infinite;
        }

        @keyframes error-float {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(-10px); }
        }

        .error-code {
            display: inline-block;
            margin-bottom: 1rem;
            padding: 0.3rem 0.9rem;
            border-radius: 999px;
            background: var(--surface-tint);
            border: 1px solid var(--line);
            color: var(--gold);
            font-size: 0.78rem;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
        }

        .error-title {
            margin: 0 0 0.75rem;
            font-size: clamp(1.9rem, 5vw, 2.85rem);
            font-weight: 800;
            line-height: 1.15;
            letter-spacing: -0.02em;
            color: var(--brand);
            background: linear-gradient(90deg, var(--brand) 0%, var(--gold) 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .error-text {
            margin: 0 auto;
            max-width: 30rem;
            color: var(--ink-soft);
            font-size: 1rem;
            line-height: 1.6;
        }

        .error-actions {
            margin-top: 2rem;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
        }

        .error-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border-radius: 999px;
            border: 1px solid transparent;
            font: inherit;
            font-size: 0.95rem;
            font-weight: 600;
            line-height: 1;
            text-decoration: none;
            cursor: pointer;
            transition: background-color .2s ease, border-color .2s ease, color .2s ease;
        }

        .error-btn svg { width: 1rem; height: 1rem; flex: none; }

        .error-btn-primary {
            background: var(--brand);
            border-color: var(--brand);
            color: #fff;
        }

        .error-btn-primary:hover {
            background: var(--brand-dark);
            border-color: var(--brand-dark);
            color: #fff;
        }

        .error-btn-ghost {
            background: transparent;
            border-color: var(--line);
            color: var(--ink);
        }

        .error-btn-ghost:hover {
            background: var(--surface-tint);
            border-color: var(--brand-light);
            color: var(--brand);
        }

        .error-btn:focus-visible {
            outline: 2px solid var(--brand);
            outline-offset: 3px;
        }

        @media (max-width: 480px) {
            .error-art { height: 10rem; }
            .error-btn { width: 100%; justify-content: center; }
        }
    </style>
</head>
<body class="error-body font-inter leading-none antialiased">
<main class="error-page">
    @yield('content')
</main>
</body>
</html>
