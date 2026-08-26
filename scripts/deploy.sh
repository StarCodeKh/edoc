#!/usr/bin/env bash
#
# Deploy eDoc on the server. Run it from the application root:
#
#     bash scripts/deploy.sh
#
# It refuses to start when something would break the site (PHP too old, local
# edits that a pull would clobber), takes the site down while it works, and
# ends by running the health check.
#
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

step()  { printf "\n\033[1m%s\033[0m\n" "$1"; }
ok()    { printf "  \033[32mok\033[0m   %s\n" "$1"; }
die()   { printf "  \033[31mFAIL\033[0m %s\n" "$1"; exit 1; }

step "Checks before touching anything"

php -r 'exit(version_compare(PHP_VERSION, "8.3", ">=") ? 0 : 1);' \
    || die "PHP $(php -r 'echo PHP_VERSION;') is below 8.3 — this release needs 8.3+. Nothing has changed; upgrade PHP first."
ok "PHP $(php -r 'echo PHP_VERSION;')"

[ -f .env ] || die ".env is missing"
ok ".env present"

if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
    git status --short --untracked-files=no | head -10
    die "there are local edits on the server; commit, stash or discard them before deploying"
fi
ok "working tree clean"

# A failed migration is the one step that is genuinely hard to undo.
if command -v mysqldump >/dev/null 2>&1; then
    DB=$(grep -E '^DB_DATABASE=' .env | cut -d= -f2- | tr -d '"')
    USER=$(grep -E '^DB_USERNAME=' .env | cut -d= -f2- | tr -d '"')
    PASS=$(grep -E '^DB_PASSWORD=' .env | cut -d= -f2- | tr -d '"')
    BACKUP="storage/app/backup-$(date +%Y%m%d-%H%M%S).sql"
    if mysqldump -u"$USER" ${PASS:+-p"$PASS"} "$DB" > "$BACKUP" 2>/dev/null; then
        ok "database dumped to $BACKUP"
    else
        printf "  \033[33mwarn\033[0m could not dump the database — continuing without a backup\n"
        rm -f "$BACKUP"
    fi
fi

step "Taking the site down"
php artisan down --retry=60 >/dev/null 2>&1 && ok "maintenance mode on" || ok "maintenance mode requested"
trap 'php artisan up >/dev/null 2>&1; echo; echo "site brought back up"' EXIT

step "Pulling"
git pull --ff-only || die "git pull failed"
ok "$(git log --oneline -1)"

step "Dependencies"
composer install --no-dev --optimize-autoloader --no-interaction || die "composer install failed"
ok "composer"
if [ -f package-lock.json ]; then
    npm ci --silent || die "npm ci failed"
    ok "npm"
fi

step "Front-end build"
# public/build is gitignored, so the compiled assets never arrive with a pull.
npm run build || die "asset build failed"
ok "assets built"
# A leftover hot file points every page at a dev server that is not there.
[ -f public/hot ] && rm -f public/hot && ok "removed stale public/hot"

step "Database"
php artisan migrate --force || die "migrations failed — the site is still down, fix and re-run"
ok "migrations"

step "Caches"
# view:clear matters most: a Blade view compiled against an older Inertia
# leaves every page blank, and it survives a pull untouched.
php artisan view:clear   >/dev/null && ok "views cleared"
php artisan config:clear >/dev/null && ok "config cleared"
php artisan cache:clear  >/dev/null && ok "application cache cleared"
php artisan config:cache >/dev/null && ok "config cached"
# No route:cache: routes/web.php defines closures, which cannot be cached.
php artisan event:cache  >/dev/null 2>&1 && ok "events cached"

step "Queue worker"
# The worker is a long-lived process holding the code it started with, so it
# has to be told to retire and pick the new release up. Harmless when no
# worker is running.
php artisan queue:restart >/dev/null 2>&1 && ok "queue worker signalled to restart"
if systemctl is-active --quiet edoc-queue 2>/dev/null; then
    ok "edoc-queue is running"
else
    printf "  \033[33mwarn\033[0m edoc-queue is not running — queued mail will sit unsent (see docs/DEPLOYMENT.md §6)\n"
fi

step "Health check"
bash scripts/check-server.sh
