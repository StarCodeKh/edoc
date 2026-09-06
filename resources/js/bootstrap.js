import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

/**
 * Reverb speaks the Pusher protocol, so this is the Pusher client pointed at
 * our own server. Echo is built only when a key is configured: pusher-js
 * accepts an empty key - what BROADCAST_DRIVER=log leaves behind - and then
 * retries a socket that can never authenticate for the life of the page.
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
