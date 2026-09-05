const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
    content: [
        // prettier-ignore
        './resources/**/*.blade.php',
        './resources/**/*.js',
        './resources/**/*.vue',
    ],
    darkMode: ['class'],
    // important: true,
    safelist: ['bg-slate-800', 'bg-slate-900'],
    theme: {
        colors: {
            transparent: 'transparent',
            current: 'currentColor',
            violet: colors.violet,
            amber: colors.amber,
            lime: colors.lime,
            cyan: colors.cyan,
            sky: colors.sky,
            purple: colors.purple,
            fuchsia: colors.fuchsia,
            pink: colors.pink,
            rose: colors.rose,
            black: colors.black,
            white: colors.white,
            blue: colors.blue,
            red: colors.red,
            orange: colors.orange,
            yellow: colors.yellow,
            green: colors.green,
            gray: colors.slate,
            slate: colors.slate,
            teal: colors.teal,
            // The app's accent, and the one place its steps are written down.
            //
            // This scale used to be a shorter, greyer set of its own, which put
            // two different indigos on screen at once: a button written
            // `bg-indigo-600` came out #5661b3, while the 73 places that name a
            // colour directly - inline styles, scoped CSS - all used #4f46e5,
            // the step this ramp actually carries. They are the same colour now.
            //
            // The gaps mattered as much as the values. 50, 200, 700 and 950 were
            // absent, so `bg-indigo-50`, `text-indigo-700` and `ring-indigo-200`
            // compiled to nothing at all - roughly 140 usages that asked for a
            // tint, a darker label or a focus ring and silently got none. The
            // ramp is complete now, so those render.
            indigo: {
                50: '#eef2ff',
                100: '#e0e7ff',
                200: '#c7d2fe',
                300: '#a5b4fc',
                400: '#818cf8',
                500: '#6366f1',
                600: '#4f46e5',
                700: '#4338ca',
                800: '#3730a3',
                900: '#312e81',
                950: '#1e1b4b',
            },
            primary: {
                50: '#eff6ff',
                100: '#dbeafe',
                200: '#bfdbfe',
                300: '#93c5fd',
                400: '#60a5fa',
                500: '#3b82f6',
                600: '#2563eb',
                700: '#1d4ed8',
                800: '#1e40af',
                900: '#1e3a8a',
                950: '#172554',
            },
        },
        screens: {
            xs: '540px',
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
            '2xl': '1536px',
        },
        fontFamily: {
            nunito: ['"Nunito", sans-serif'],
        },
        extend: {
            colors: {
                dark: '#3c4858',
                black: '#161c2d',
                'dark-footer': '#192132',
            },
            display: ['group-hover'],
            borderColor: (theme) => ({
                DEFAULT: theme('colors.gray.200', 'currentColor'),
            }),
            fontFamily: {
                sans: ['Cerebri Sans', ...defaultTheme.fontFamily.sans],
                // Resolve through the CSS variables defined in resources/css/font.scss,
                // so `font-khmer` etc. follow whatever those variables are set to.
                khmer: ['var(--font-khmer-body)'],
                'khmer-serif': ['var(--font-khmer-serif)'],
                'khmer-display': ['var(--font-khmer-display)'],
            },
            boxShadow: (theme) => ({
                outline: '0 0 0 2px ' + theme('colors.indigo.500'),
                sm: '0 2px 4px 0 rgb(60 72 88 / 0.15)',
                DEFAULT: '0 0 3px rgb(60 72 88 / 0.15)',
                md: '0 5px 13px rgb(60 72 88 / 0.20)',
                lg: '0 10px 25px -3px rgb(60 72 88 / 0.15)',
                xl: '0 20px 25px -5px rgb(60 72 88 / 0.1), 0 8px 10px -6px rgb(60 72 88 / 0.1)',
                '2xl': '0 25px 50px -12px rgb(60 72 88 / 0.25)',
                inner: 'inset 0 2px 4px 0 rgb(60 72 88 / 0.05)',
                testi: '2px 2px 2px -1px rgb(60 72 88 / 0.15)',
            }),
            fill: (theme) => theme('colors'),
            spacing: {
                0.75: '0.1875rem',
                3.25: '0.8125rem',
            },

            maxWidth: ({ theme, breakpoints }) => ({
                1200: '71.25rem',
                992: '60rem',
                768: '45rem',
            }),

            zIndex: {
                1: '1',
                2: '2',
                3: '3',
                999: '999',
            },
        },
    },
    plugins: [require('@tailwindcss/typography')],
};
