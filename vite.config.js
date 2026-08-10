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
});
