# eDoc

Document and task management for the Secretariat General — Laravel 13, Vue 3 and
Inertia, running at **https://edoc.cgmc.gov.kh**.

## Requirements

| | Version |
|---|---|
| PHP | **8.3+** (production runs 8.4) |
| MySQL / MariaDB | 5.7+ / 10.3+ |
| Node.js | 18+ |
| Composer | 2.x |

PHP extensions: `mbstring openssl pdo pdo_mysql tokenizer xml ctype json curl fileinfo gd exif zip`

## Local setup

```bash
git clone <repo> edoc && cd edoc

composer install
npm install

cp .env.example .env
php artisan key:generate
# set DB_DATABASE / DB_USERNAME / DB_PASSWORD in .env, then:
php artisan migrate --seed

npm run dev          # Vite on :5173
php artisan serve    # app on :8000
```

## Deploying to the server

**Read [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) before your first deploy.** It
covers the nginx and Apache vhosts, permissions, rollback, and the failures this
project has actually hit in production.

The short version, from the application root on the server:

```bash
bash scripts/deploy.sh
```

That takes the site down, backs up the database, pulls, reinstalls dependencies,
rebuilds the assets, migrates, clears the caches and brings it back up. To check
a running server without changing anything:

```bash
bash scripts/check-server.sh
```

### Three things that will bite you

- **A `git pull` does not update dependencies here.** `vendor/` and
  `node_modules/` are gitignored but partly tracked from before that rule
  existed, so a pull can deliver a class that calls another class it left
  behind. Always run `composer install` and `npm ci`. If Composer answers
  *"Nothing to install"* while the site is broken, `rm -rf vendor` first — it is
  trusting a committed `installed.json` that lies.
- **`public/build` is never committed.** Every deploy must run `npm run build`,
  or the site comes up blank.
- **nginx must point at the right PHP-FPM socket.** The server has 8.2, 8.3 and
  8.4 installed side by side; a `fastcgi_pass` left on an old one produces
  `ERR_EMPTY_RESPONSE` while the command line works perfectly.

## Caches

```bash
php artisan view:clear
php artisan config:clear
php artisan cache:clear
php artisan config:cache
```

**Do not run `php artisan route:cache`** — `routes/web.php` defines route
closures, which cannot be serialised. It fails, and on an already-cached app it
leaves the site broken.

`view:clear` is the one that matters after an upgrade: a Blade view compiled by
an older release survives a pull and turns every page blank.

## Queue worker

With `QUEUE_ENABLE=true` mail leaves the request queued, so a worker has to be
running or nothing is ever sent. In production run one permanently — it picks
each job up within a second, rather than whenever a timer next fires:

```bash
sudo cp scripts/edoc-queue.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now edoc-queue
```

Locally, the same thing in the foreground:

```bash
php artisan queue:work --queue=high,default --sleep=1
```

A worker holds the code it started with, so every deploy runs
`php artisan queue:restart` (`scripts/deploy.sh` does).

On shared hosting, where no daemon is allowed, cron is the fallback — once a
minute is as fast as it goes:

```bash
* * * * * php /path/to/application/artisan queue:work --queue=high,default --stop-when-empty --max-time=55
```

See `docs/DEPLOYMENT.md` §6.

## Tests

```bash
php artisan test              # feature and unit
npm run test:browser          # Playwright, drives the installed Chrome
npm run test:browser:headed   # same, with a visible window
```

Browser tests expect the app on `http://127.0.0.1:8000`; they fail on console
errors, page errors, failed requests and an empty `#app`.

## Code style

```bash
./vendor/bin/pint       # PHP
npm run format          # JS, Vue, SCSS
npm run format:check    # verify without writing
```

## Layout

```
app/                 Laravel application code
  Support/           EnvFile, GlideResponseFactory — local replacements for
                     packages that stopped supporting current Laravel
resources/js/
  Pages/             Inertia page components
  Shared/            layout, menus, modals, reusable components
resources/css/       SCSS; responsive.scss loads last and has the final say
lang/{en,kh,cn}.json UI strings, three-way parity
docs/DEPLOYMENT.md   server setup and troubleshooting
scripts/             deploy.sh, check-server.sh
tests/               Feature, Unit, Browser
```

## Licence

MIT.
