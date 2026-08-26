# Deploying eDoc

The production site is `https://edoc.cgmc.gov.kh`, served from `/var/www/html/edoc`.

Two things about this repository decide most of what follows:

- **`vendor/` and `node_modules/` are half-tracked, and it is a trap.** Both are
  in `.gitignore`, but thousands of their files were committed before that rule
  existed. Git keeps tracking files it already tracks and silently refuses to add
  *new* ones — so an upgrade commits the changed files of a package while leaving
  its new files behind. A pull then hands the server a class that calls another
  class that isn't there. **Never rely on a pull to update dependencies. Always
  run `composer install` and `npm ci`,** and when in doubt delete the directory
  first (see §5).
- **`public/build` is not committed at all.** The compiled CSS and JS never
  arrive with a pull. **Every deploy must run `npm run build`** on the server, or
  the site comes up blank.

---

## 1. Requirements

| | Version | Check |
|---|---|---|
| PHP | **8.3 or newer** | `php -v` |
| MySQL / MariaDB | 5.7+ / 10.3+ | `mysql --version` |
| Node.js | 18+ | `node -v` |
| Composer | 2.x | `composer --version` |

PHP extensions: `mbstring openssl pdo pdo_mysql tokenizer xml ctype json curl fileinfo gd exif zip`

```bash
php -m | grep -E "mbstring|pdo_mysql|gd|exif|zip|curl"
```

> **The web PHP and the CLI PHP are often different versions**, and this server
> has PHP-FPM masters for 8.2, 8.3 and 8.4 installed side by side. What matters
> is the one nginx is pointed at — see §2. Confirm it from the browser's side:
> ```bash
> echo '<?php echo PHP_VERSION;' > public/_v.php
> curl https://edoc.cgmc.gov.kh/_v.php && rm public/_v.php
> ```

---

## 2. Web server

The document root must be **`/var/www/html/edoc/public`**, never the project root —
pointing it one level up exposes `.env`.

### nginx

```nginx
server {
    listen 443 ssl http2;
    server_name edoc.cgmc.gov.kh;
    root /var/www/html/edoc/public;

    index index.php;
    charset utf-8;

    client_max_body_size 60M;          # attachments are capped at 50 MB

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;   # MUST match the PHP `php -v` reports
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 120;
    }

    # Uploads must never execute.
    location ~* ^/files/.*\.(php|phtml|phar)$ { deny all; }

    location ~ /\.(?!well-known) { deny all; }

    error_log  /var/log/nginx/edoc-error.log;
    access_log /var/log/nginx/edoc-access.log;
}
```

### Apache

`public/.htaccess` ships with the app and handles rewrites. The vhost needs:

```apache
<VirtualHost *:443>
    ServerName edoc.cgmc.gov.kh
    DocumentRoot /var/www/html/edoc/public

    <Directory /var/www/html/edoc/public>
        AllowOverride All
        Require all granted
    </Directory>

    # Uploads must never execute.
    <Directory /var/www/html/edoc/public/files>
        php_admin_flag engine off
    </Directory>

    ErrorLog  ${APACHE_LOG_DIR}/edoc-error.log
    CustomLog ${APACHE_LOG_DIR}/edoc-access.log combined
</VirtualHost>
```

PHP limits (`php.ini`), sized for 50 MB attachments:

```ini
upload_max_filesize = 60M
post_max_size = 64M
memory_limit = 256M
max_execution_time = 120
```

---

## 3. Permissions

The web user (`www-data`) must own the two writable trees and nothing else:

```bash
cd /var/www/html/edoc
sudo chown -R www-data:www-data storage bootstrap/cache public/files public/images
sudo find storage bootstrap/cache -type d -exec chmod 775 {} \;
sudo find storage bootstrap/cache -type f -exec chmod 664 {} \;
```

---

## 4. `.env` on the server

Never committed; it lives only on the server. The values that must differ from
development:

```dotenv
APP_ENV=production
APP_DEBUG=false                 # true here publishes stack traces to the public
APP_URL=https://edoc.cgmc.gov.kh
APP_KEY=base64:...              # php artisan key:generate --force if missing

DB_CONNECTION=mysql
DB_DATABASE=e_document
DB_USERNAME=...
DB_PASSWORD=...

SESSION_SECURE_COOKIE=true      # the site is HTTPS
QUEUE_CONNECTION=database
```

---

## 5. Updating to a new release

```bash
cd /var/www/html/edoc
bash scripts/deploy.sh
```

That script does everything below and refuses to start if PHP is too old or the
server has local edits. To do it by hand:

```bash
cd /var/www/html/edoc

# 1. take the site down
php artisan down --retry=60

# 2. back up the database first
mysqldump -u USER -p e_document > storage/app/backup-$(date +%F-%H%M).sql

# 3. pull the code
git pull --ff-only origin main

# 4. dependencies — a pull does NOT update these correctly, see the note above
composer install --no-dev --optimize-autoloader
npm ci

# 5. build the front end — public/build is NOT in the repo
npm run build

# 6. a leftover dev-server marker blanks every page
rm -f public/hot

# 7. database
php artisan migrate --force

# 8. caches: clear before rebuilding
php artisan view:clear
php artisan config:clear
php artisan cache:clear
php artisan config:cache
#   note: do NOT run route:cache — routes/web.php defines closures

# 9. back up
php artisan up

# 10. verify
bash scripts/check-server.sh
```

**Step 8 is the one people skip.** A Blade view compiled by an older release
stays on disk through a pull and is what leaves every page blank after an
Inertia upgrade.

If `composer install` says **"Nothing to install, update or remove"** while the
site is still broken, it is being fooled by the committed
`vendor/composer/installed.json`, which claims everything is present. Delete the
directory so there is no manifest left to trust:

```bash
rm -f bootstrap/cache/*.php
rm -rf vendor node_modules
composer install --no-dev --optimize-autoloader
npm ci && npm run build
```

---

## 6. Rolling back

A reset restores the code, but **not** a working `vendor/` — reinstall it:

```bash
cd /var/www/html/edoc
git reset --hard <commit>
rm -rf vendor && composer install --no-dev --optimize-autoloader
npm ci && npm run build   # assets must match the code you rolled back to
php artisan view:clear && php artisan config:clear && php artisan cache:clear
php artisan up
```

Known-good commits:

| Commit | What it is |
|---|---|
| `2b0cdc57` | Laravel 10, before the framework upgrade |

---

## 7. When something breaks

| Symptom | Cause | Fix |
|---|---|---|
| **`ERR_EMPTY_RESPONSE`**, nothing in the browser | The FPM worker died before writing a byte. Nearly always nginx pointed at an **old PHP-FPM socket** — this server has 8.2/8.3/8.4 installed together and `fastcgi_pass` was left on 8.2 | `sudo nginx -T \| grep fastcgi_pass`, point it at the version `php -v` reports, `nginx -t && systemctl reload nginx` |
| **Class "…" not found** on every artisan command | Half-tracked `vendor/` — the pull brought a caller without its new files | `rm -rf vendor && composer install --no-dev -o` |
| **500 on every page, empty `laravel.log`** | `storage/` owned by `ubuntu` while FPM runs as `www-data`, so Laravel cannot even write the error | see §3 |
| **Blank white page**, HTML arrives but nothing renders | A Blade view compiled against an older Inertia, or assets that do not match the code | `php artisan view:clear` then `npm run build` |
| **Blank page, scripts 404 to `localhost:5173`** | A stale `public/hot` from a dev server | `rm public/hot` |
| **"Unable to locate file in Vite manifest"** | `public/build` missing | `npm run build` |
| **Site stuck on the maintenance page** | `artisan down` never got its `up` | `php artisan up`, or delete `storage/framework/down` |

Logs, in the order worth reading:

```bash
# logs are rotated daily; laravel.log itself is usually empty
tail -80 "$(ls -t storage/logs/laravel-*.log | head -1)"
sudo tail -50 /var/log/nginx/error.log
sudo tail -50 /var/log/php8.4-fpm.log
```

---

## 8. Health check

Read-only, changes nothing, run it any time:

```bash
bash scripts/check-server.sh
```

It reports PHP version and extensions, whether the checkout matches
`origin/main`, whether `vendor/` is installed, whether `public/hot` is present
(it must not be) and the build is current, `APP_ENV` / `APP_DEBUG` / `APP_KEY` /
`SESSION_SECURE_COOKIE`, database reachability, pending migrations, and the
writable paths.
