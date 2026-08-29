#!/usr/bin/env bash
#
# Deploy 360 Tours React frontend on Ubuntu + Apache
#
# Runs automatically (no extra commands needed after push):
#   git pull
#   source .env.production
#   npm ci
#   npm run generate:seo
#   npm run generate:sitemap
#   npm run build
#   write .htaccess (SPA + gzip + cache)
#   rsync to WEB_ROOT (if set)
#   chown www-data
#   a2enmod rewrite deflate headers expires (+ optional apache reload)
#
# Usage (on the server, from repo root):
#   chmod +x scripts/deploy-ubuntu.sh
#   ./scripts/deploy-ubuntu.sh
#
# Overrides:
#   APP_DIR=/var/www/html/naasei/projects/360-tour \
#   WEB_ROOT=/var/www/html/naasei/projects/360-tour/build \
#   BRANCH=main \
#   RELOAD_APACHE=1 \
#   ./scripts/deploy-ubuntu.sh
#
# Apache vhost checklist:
#   DocumentRoot → ${WEB_ROOT}  (usually .../360-tour/build)
#   AllowOverride All
#   sudo a2enmod rewrite deflate headers expires
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
RELOAD_APACHE="${RELOAD_APACHE:-0}"
# Reset tracked local edits before pull (sitemap/seo from last deploy). Untracked files (e.g. google*.html) are kept.
GIT_RESET="${GIT_RESET:-1}"
WEBSITE_URL="${REACT_APP_WEBSITE_URL:-https://360toursghana.com}"
API_URL="${REACT_APP_API_URL:-https://api.360toursghana.com/api}"

# ── Helpers ──────────────────────────────────────────────────────────────────
log()  { echo "[deploy] $*"; }
warn() { echo "[deploy] WARN: $*" >&2; }
fail() { echo "[deploy] ERROR: $*" >&2; exit 1; }

write_htaccess() {
  local target_dir="$1"
  log "Writing Apache .htaccess → ${target_dir}/.htaccess"
  cat > "${target_dir}/.htaccess" <<'HTACCESS'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [QSA,L]
</IfModule>

Options -Indexes

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json image/svg+xml
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "\.(js|css)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\.(jpg|jpeg|png|gif|webp|svg|ico|woff2?|webmanifest)$">
    Header set Cache-Control "public, max-age=2592000"
  </FilesMatch>
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/jpeg "access plus 30 days"
  ExpiresByType image/png "access plus 30 days"
  ExpiresByType image/webp "access plus 30 days"
</IfModule>
HTACCESS
}

ensure_apache_modules() {
  if ! command -v a2enmod >/dev/null 2>&1; then
    warn "a2enmod not found — enable rewrite, deflate, headers, expires manually"
    return 0
  fi
  log "Ensuring Apache modules (rewrite, deflate, headers, expires)..."
  sudo a2enmod rewrite deflate headers expires 2>/dev/null || \
    warn "Could not a2enmod — run: sudo a2enmod rewrite deflate headers expires"
}

reload_apache() {
  if [[ "${RELOAD_APACHE}" != "1" ]]; then
    log "Skipping Apache reload (set RELOAD_APACHE=1 to reload)"
    return 0
  fi
  log "Reloading Apache..."
  sudo systemctl reload apache2
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
log "Website URL:   ${WEBSITE_URL}"
log "API URL:       ${API_URL}"

# ── Pull latest code ─────────────────────────────────────────────────────────
if [[ "${SKIP_PULL}" != "1" ]]; then
  log "Fetching ${GIT_REMOTE}/${BRANCH}..."
  git fetch "${GIT_REMOTE}" "${BRANCH}"
  git checkout "${BRANCH}" 2>/dev/null || git checkout -b "${BRANCH}" "${GIT_REMOTE}/${BRANCH}"

  if [[ "${GIT_RESET}" == "1" ]]; then
    if ! git diff-index --quiet HEAD -- 2>/dev/null || ! git diff-index --quiet --cached HEAD -- 2>/dev/null; then
      log "Local tracked changes detected (often sitemap/seo from a previous deploy) — resetting to ${GIT_REMOTE}/${BRANCH}..."
    fi
    git reset --hard "${GIT_REMOTE}/${BRANCH}"
  else
    git pull "${GIT_REMOTE}" "${BRANCH}"
  fi
else
  log "Skipping git pull (SKIP_PULL=1)"
fi

# ── Production env ───────────────────────────────────────────────────────────
if [[ -f "${APP_DIR}/.env.production" ]]; then
  log "Using .env.production for build"
  set -a
  # shellcheck disable=SC1091
  source "${APP_DIR}/.env.production"
  set +a
else
  warn ".env.production missing — build uses defaults / shell env"
fi

export NODE_ENV=production
export REACT_APP_WEBSITE_URL="${REACT_APP_WEBSITE_URL:-${WEBSITE_URL}}"
export REACT_APP_API_URL="${REACT_APP_API_URL:-${API_URL}}"

# ── Install dependencies ─────────────────────────────────────────────────────
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

# ── SEO assets & sitemap (explicit — also run again via npm prebuild on build) ─
log "Generating SEO assets (favicons, og-image)..."
"${NPM_CMD}" run generate:seo

log "Generating sitemap (tours from API + stories from content)..."
"${NPM_CMD}" run generate:sitemap

# ── Production build ─────────────────────────────────────────────────────────
log "Building production bundle (npm run build)..."
"${NPM_CMD}" run build

[[ -d "${APP_DIR}/build" ]] || fail "Build folder missing after npm run build"
[[ -f "${APP_DIR}/build/index.html" ]] || fail "build/index.html missing — build may have failed"

# CRA copies public/ → build/; ensure sitemap landed in build/
if [[ -f "${APP_DIR}/public/sitemap.xml" ]] && [[ ! -f "${APP_DIR}/build/sitemap.xml" ]]; then
  log "Copying public/sitemap.xml → build/sitemap.xml"
  cp "${APP_DIR}/public/sitemap.xml" "${APP_DIR}/build/sitemap.xml"
fi

if [[ -f "${APP_DIR}/build/sitemap.xml" ]]; then
  log "Sitemap OK: build/sitemap.xml"
else
  fail "build/sitemap.xml missing after generate:sitemap + build"
fi

[[ -f "${APP_DIR}/build/robots.txt" ]] || warn "build/robots.txt missing"

# Server-only Search Console verification (often untracked; CRA only copies tracked public/ files)
shopt -s nullglob
for verify_file in "${APP_DIR}"/public/google*.html; do
  cp "${verify_file}" "${APP_DIR}/build/$(basename "${verify_file}")"
  log "Copied Search Console verification → build/$(basename "${verify_file}")"
done
shopt -u nullglob

# ── Apache SPA + performance .htaccess ───────────────────────────────────────
write_htaccess "${APP_DIR}/build"

# ── Sync to web root if different from build folder ───────────────────────────
if [[ "$(realpath "${WEB_ROOT}")" != "$(realpath "${APP_DIR}/build")" ]]; then
  command -v rsync >/dev/null 2>&1 || fail "rsync required when WEB_ROOT != build/"
  log "Syncing build/ → ${WEB_ROOT}..."
  mkdir -p "${WEB_ROOT}"
  rsync -a --delete "${APP_DIR}/build/" "${WEB_ROOT}/"
  write_htaccess "${WEB_ROOT}"
fi

# ── Permissions (Apache www-data) ────────────────────────────────────────────
if id www-data >/dev/null 2>&1; then
  log "Setting ownership for Apache (www-data)..."
  sudo chown -R www-data:www-data "${WEB_ROOT}" 2>/dev/null || \
    warn "Could not chown — run: sudo chown -R www-data:www-data ${WEB_ROOT}"
fi

ensure_apache_modules
reload_apache

log ""
log "Deploy complete."
log "  DocumentRoot should be: ${WEB_ROOT}"
log "  Verify SPA routes:      ${WEBSITE_URL}/tours"
log "  Verify admin login:     ${WEBSITE_URL}/admin/login"
log "  Verify sitemap:         ${WEBSITE_URL}/sitemap.xml"
log ""
log "If URLs 404, check Apache vhost has AllowOverride All for ${WEB_ROOT}"
