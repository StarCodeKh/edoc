#!/usr/bin/env bash
# Read-only health check for a deployed eDoc.
# Changes nothing. Run it from the application root:
#
#     bash scripts/check-server.sh
#
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

pass() { printf "  \033[32mok\033[0m   %s\n" "$1"; }
warn() { printf "  \033[33mwarn\033[0m %s\n" "$1"; }
fail() { printf "  \033[31mFAIL\033[0m %s\n" "$1"; FAILED=1; }
FAILED=0

echo "── PHP ──"
PHP_V=$(php -r 'echo PHP_VERSION;')
if php -r 'exit(version_compare(PHP_VERSION, "8.3", ">=") ? 0 : 1);'; then
    pass "PHP $PHP_V (Laravel 13 needs 8.3+)"
else
    fail "PHP $PHP_V is below 8.3 — Laravel 13 will not boot"
fi
# Captured once: piping php -m into grep -q trips pipefail when grep exits early.
MODULES=$(php -m | tr 'A-Z' 'a-z')
MISSING=""
for ext in mbstring openssl pdo tokenizer xml ctype json curl fileinfo gd exif zip; do
    printf '%s\n' "$MODULES" | grep -qx "$ext" || MISSING="$MISSING $ext"
done
[ -z "$MISSING" ] && pass "required extensions present" || fail "missing PHP extensions:$MISSING"

echo "── Code ──"
if [ -d .git ]; then
    git fetch --quiet origin 2>/dev/null
    LOCAL=$(git rev-parse --short HEAD)
    REMOTE=$(git rev-parse --short origin/main 2>/dev/null || echo '?')
    [ "$LOCAL" = "$REMOTE" ] && pass "on origin/main ($LOCAL)" || warn "HEAD $LOCAL, origin/main $REMOTE — not in sync"
    [ -z "$(git status --porcelain --untracked-files=no)" ] && pass "working tree clean" || warn "uncommitted changes on the server"
fi
[ -f vendor/autoload.php ] && pass "composer dependencies installed" || fail "vendor/ missing — run: composer install --no-dev -o"

echo "── Front-end assets ──"
if [ -f public/hot ]; then
    fail "public/hot exists — pages will try to load assets from $(cat public/hot) and go blank. Delete it."
else
    pass "no public/hot (correct for production)"
fi
if [ -f public/build/manifest.json ]; then
    pass "build manifest present ($(date -r public/build/manifest.json '+%Y-%m-%d %H:%M'))"
    NEWER=$(find resources/js resources/css -newer public/build/manifest.json -name '*.vue' -o -newer public/build/manifest.json -name '*.js' 2>/dev/null | head -1)
    [ -n "$NEWER" ] && warn "source is newer than the build — run: npm ci && npm run build"
else
    fail "public/build/manifest.json missing — run: npm ci && npm run build"
fi

echo "── Laravel ──"
APP_ENV=$(php artisan tinker --execute='echo config("app.env");' 2>/dev/null | tail -1)
APP_DEBUG=$(php artisan tinker --execute='echo config("app.debug") ? "true" : "false";' 2>/dev/null | tail -1)
[ "$APP_ENV" = "production" ] && pass "APP_ENV=production" || warn "APP_ENV=$APP_ENV (expected production)"
[ "$APP_DEBUG" = "false" ] && pass "APP_DEBUG=false" || fail "APP_DEBUG=$APP_DEBUG — stack traces are public. Set APP_DEBUG=false."
grep -q '^APP_KEY=base64:' .env 2>/dev/null && pass "APP_KEY set" || fail "APP_KEY missing — run: php artisan key:generate"
grep -q '^SESSION_SECURE_COOKIE=true' .env 2>/dev/null && pass "SESSION_SECURE_COOKIE=true" || warn "SESSION_SECURE_COOKIE not true (set it when serving over HTTPS)"

php artisan migrate:status >/dev/null 2>&1 && pass "database reachable" || fail "cannot reach the database"
PENDING=$(php artisan migrate:status 2>/dev/null | grep -c "Pending" || true)
[ "${PENDING:-0}" -eq 0 ] && pass "no pending migrations" || fail "$PENDING pending migrations — run: php artisan migrate --force"

echo "── Writable paths ──"
for d in storage bootstrap/cache; do
    [ -w "$d" ] && pass "$d writable" || fail "$d not writable by the web user"
done

# Uploads are served straight off disk by nginx, which needs to traverse every
# directory on the way. A 0700 directory here is answered as 403 Forbidden, not
# 404, and looks like a broken PDF rather than a permission problem.
for d in public/files public/images; do
    [ -d "$d" ] || continue
    CLOSED=$(find "$d" -type d ! -perm -o+rx 2>/dev/null | head -3)
    if [ -n "$CLOSED" ]; then
        fail "$d has directories the web server cannot traverse (nginx will answer 403):"
        echo "$CLOSED" | sed 's/^/       /'
        echo "       fix: sudo chmod -R u=rwX,go=rX $d"
    else
        pass "$d readable by the web server"
    fi
done

echo "── Caches ──"
# A compiled view from before an Inertia upgrade is what turns every page blank.
[ -d storage/framework/views ] && pass "view cache dir present ($(ls storage/framework/views/*.php 2>/dev/null | wc -l | tr -d ' ') compiled)"

echo
[ "$FAILED" -eq 0 ] && echo "All checks passed." || echo "Something above needs attention."
exit "$FAILED"
