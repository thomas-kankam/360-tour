#!/usr/bin/env bash
#
# Deploy 360 Tours React app on Ubuntu + Apache
#
# Fixes "Not Found" on direct URLs like /admin/login by ensuring
# build/.htaccess contains SPA rewrite rules.
#
# Usage (on the server):
#   chmod +x scripts/deploy-ubuntu.sh
#   ./scripts/deploy-ubuntu.sh
#
# Or with overrides:
#   APP_DIR=/var/www/360-tour WEB_ROOT=/var/www/360-tour/build BRANCH=main ./scripts/deploy-ubuntu.sh
#
# Apache requirement: AllowOverride All for the document root
#   sudo a2enmod rewrite
#   # In your vhost or site config:
#   # <Directory /var/www/360-tour/build>
#   #   AllowOverride All
#   #   Require all granted
#   # </Directory>
#   sudo systemctl reload apache2

set -euo pipefail

# ── Config (override via environment) ────────────────────────────────────────
APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
WEB_ROOT="${WEB_ROOT:-${APP_DIR}/build}"
BRANCH="${BRANCH:-main}"
GIT_REMOTE="${GIT_REMOTE:-origin}"
NPM_CMD="${NPM_CMD:-npm}"
SKIP_PULL="${SKIP_PULL:-0}"
SKIP_INSTALL="${SKIP_INSTALL:-0}"

# ── Helpers ──────────────────────────────────────────────────────────────────
log()  { echo "[deploy] $*"; }
fail() { echo "[deploy] ERROR: $*" >&2; exit 1; }

write_htaccess() {
  local target_dir="$1"
  log "Writing SPA .htaccess to ${target_dir}/.htaccess"
  cat > "${target_dir}/.htaccess" <<'HTACCESS'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [QSA,L]
</IfModule>

Options -Indexes
HTACCESS
}

# ── Preflight ────────────────────────────────────────────────────────────────
command -v git >/dev/null 2>&1 || fail "git is not installed"
command -v "${NPM_CMD}" >/dev/null 2>&1 || fail "${NPM_CMD} is not installed"
[[ -d "${APP_DIR}" ]] || fail "APP_DIR does not exist: ${APP_DIR}"
[[ -f "${APP_DIR}/package.json" ]] || fail "Not a Node project: ${APP_DIR}/package.json missing"

cd "${APP_DIR}"
log "App directory: ${APP_DIR}"
log "Web root:      ${WEB_ROOT}"
log "Branch:        ${BRANCH}"

# ── Pull latest code ─────────────────────────────────────────────────────────
if [[ "${SKIP_PULL}" != "1" ]]; then
  log "Fetching ${GIT_REMOTE}/${BRANCH}..."
  git fetch "${GIT_REMOTE}" "${BRANCH}"
  git checkout "${BRANCH}"
  git pull "${GIT_REMOTE}" "${BRANCH}"
else
  log "Skipping git pull (SKIP_PULL=1)"
fi

# ── Install dependencies ───────────────────────────────────────────────────
if [[ "${SKIP_INSTALL}" != "1" ]]; then
  if [[ -f package-lock.json ]]; then
    log "Installing dependencies (npm ci)..."
    "${NPM_CMD}" ci
  else
    log "Installing dependencies (npm install)..."
    "${NPM_CMD}" install
  fi
else
  log "Skipping npm install (SKIP_INSTALL=1)"
fi

# ── Build ────────────────────────────────────────────────────────────────────
log "Building production bundle..."
NODE_ENV=production "${NPM_CMD}" run build

[[ -d "${APP_DIR}/build" ]] || fail "Build folder missing after npm run build"
[[ -f "${APP_DIR}/build/index.html" ]] || fail "build/index.html missing — build may have failed"

# ── Ensure .htaccess in build (SPA routing) ──────────────────────────────────
# public/.htaccess is copied by CRA, but we write again so deploy always works
write_htaccess "${APP_DIR}/build"

# ── Sync to web root if different from build folder ──────────────────────────
if [[ "$(realpath "${WEB_ROOT}")" != "$(realpath "${APP_DIR}/build")" ]]; then
  log "Syncing build/ → ${WEB_ROOT}..."
  mkdir -p "${WEB_ROOT}"
  rsync -a --delete "${APP_DIR}/build/" "${WEB_ROOT}/"
  write_htaccess "${WEB_ROOT}"
fi

# ── Permissions (Apache www-data) ───────────────────────────────────────────
if id www-data >/dev/null 2>&1; then
  log "Setting ownership for Apache (www-data)..."
  sudo chown -R www-data:www-data "${WEB_ROOT}" 2>/dev/null || \
    log "Could not chown (run manually if needed): sudo chown -R www-data:www-data ${WEB_ROOT}"
fi

log "Deploy complete."
log "Verify: https://360toursghana.com/admin/login"
log ""
log "If URLs still 404, check Apache:"
log "  1. sudo a2enmod rewrite && sudo systemctl reload apache2"
log "  2. DocumentRoot points to: ${WEB_ROOT}"
log "  3. AllowOverride All is set for that directory"
