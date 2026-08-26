import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

/**
 * Reverb speaks the Pusher protocol, so this is still the Pusher client - it
 * just points at our own server instead of pusher.com.
 *
 * Echo is only constructed when a key is actually configured. pusher-js
 * rejects a null key but accepts an empty one, so a blank key - what
 * BROADCAST_DRIVER=log leaves behind - opens a socket that can never
 * authenticate and retries it for the life of the page, silently.
 */
const reverbKey = import.meta.env.VITE_REVERB_APP_KEY;
const reverbScheme = import.meta.env.VITE_REVERB_SCHEME ?? 'https';

window.Echo = reverbKey
    ? new Echo({
          broadcaster: 'reverb',
          key: reverbKey,
          wsHost: import.meta.env.VITE_REVERB_HOST,
          wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 80),
          wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 443),
          forceTLS: reverbScheme === 'https',
          enabledTransports: ['ws', 'wss'],
      })
    : null;
