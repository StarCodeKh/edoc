<template>
    <div v-if="links.length > 3">
        <div class="flex flex-wrap p-nat -mb-1">
            <template v-for="(link, key) in normalizedLinks">
                <div
                    v-if="link.url === null"
                    :key="key"
                    class="mr-1 mb-1 px-4 py-3 text-sm leading-4 text-gray-400 border rounded"
                    v-html="link.label"
                />
                <Link
                    v-else
                    :key="key + 1"
                    class="mr-1 mb-1 px-4 py-3 text-sm leading-4 border rounded"
                    :class="{ active: link.active }"
                    :href="link.url"
                    v-html="link.label"
                />
            </template>
        </div>
    </div>
</template>

<script>
import { Link } from '@inertiajs/vue3';
export default {
    props: {
        links: Array,
    },
    components: {
        Link,
    },
    computed: {
        normalizedLinks() {
            return (this.links || []).map((link) => ({ ...link, url: this.samePage(link.url) }));
        },
    },
    methods: {
        /**
         * Laravel builds pagination URLs from the incoming request, so behind a
         * proxy that terminates TLS without forwarding X-Forwarded-Proto they
         * come back `http://` while the page is `https://`. The browser sees a
         * different origin, blocks the request, and the click does nothing.
         * Only path and query are needed, so the origin is dropped.
         */
        samePage(url) {
            if (!url) return url;
            try {
                const parsed = new URL(url, window.location.origin);
                return parsed.pathname + parsed.search + parsed.hash;
            } catch (e) {
                return url;
            }
        },
    },
};
</script>
