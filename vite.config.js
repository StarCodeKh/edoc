import { createRequire } from 'node:module';
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import svgLoader from "vite-svg-loader";
import i18n from 'laravel-vue-i18n/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const require = createRequire( import.meta.url );
export default defineConfig({
    plugins: [
        nodePolyfills(),
        laravel({
            input: 'resources/js/app.js',
            ssr: 'resources/js/ssr.js',
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
        svgLoader(),
        i18n()
    ],
    optimizeDeps: {
        include: ['codemirror-editor-vue3']
    },
    build: {
        rollupOptions: {
            output: {
                // pdf.js ships its worker as .mjs, and a lot of web servers hand
                // that extension out as application/octet-stream - which browsers
                // refuse to run as a module ("Failed to fetch dynamically imported
                // module"). Emit it as .js so the server's normal JavaScript MIME
                // type applies. Everything else keeps Vite's default name.
                assetFileNames: (assetInfo) => {
                    const name = assetInfo.names?.[0] ?? assetInfo.name ?? '';
                    if (name.endsWith('.mjs')) {
                        return 'assets/[name]-[hash].js';
                    }
                    return 'assets/[name]-[hash][extname]';
                },
            },
        },
    },
});
