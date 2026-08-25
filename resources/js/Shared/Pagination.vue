<template>
  <div v-if="links.length > 3">
    <div class="flex flex-wrap p-nat -mb-1">
      <template v-for="(link, key) in normalizedLinks">
        <div v-if="link.url === null" :key="key" class="mr-1 mb-1 px-4 py-3 text-sm leading-4 text-gray-400 border rounded" v-html="link.label" />
        <Link v-else :key="key+1" class="mr-1 mb-1 px-4 py-3 text-sm leading-4 border rounded" :class="{ 'active': link.active }" :href="link.url" v-html="link.label" />
      </template>
    </div>
  </div>
</template>

<script>
import {Link} from '@inertiajs/vue3'
export default {
  props: {
    links: Array,
  },
    components: {
        Link,
    },
    computed: {
        normalizedLinks() {
            return (this.links || []).map(link => ({ ...link, url: this.samePage(link.url) }))
        },
    },
    methods: {
        /**
         * Laravel builds pagination URLs from the incoming request
         * (Paginator::currentPathResolver -> $request->url()), so the scheme and
         * host come from whatever the app believes it was reached on. Behind a
         * proxy that terminates TLS without forwarding X-Forwarded-Proto, that
         * is `http://` while the page itself is `https://` - a different origin
         * as far as the browser is concerned, so Inertia's request is blocked
         * and the click appears to do nothing.
         *
         * Only the path and query are ever needed here, so the origin is
         * dropped and every link stays on the page we are already on.
         */
        samePage(url) {
            if (!url) return url
            try {
                const parsed = new URL(url, window.location.origin)
                return parsed.pathname + parsed.search + parsed.hash
            } catch (e) {
                return url
            }
        },
    },
}
</script>
