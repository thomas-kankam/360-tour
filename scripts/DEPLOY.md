# Frontend deploy (Ubuntu + Apache)

**One command on the server** (everything else is inside the script):

```bash
cd /var/www/html/naasei/projects/360-tour
RELOAD_APACHE=1 ./scripts/deploy-ubuntu.sh
```

## Commands the script runs for you

| Step | Command |
|------|---------|
| 1 | `git pull origin main` |
| 2 | `source .env.production` |
| 3 | `npm ci` |
| 4 | **`npm run generate:seo`** — favicons, og-image |
| 5 | **`npm run generate:sitemap`** — tours + stories → `public/sitemap.xml` |
| 6 | **`npm run build`** — production React bundle (prebuild runs SEO/sitemap again) |
| 7 | Verify / copy `sitemap.xml` into `build/` |
| 8 | Write Apache `.htaccess` (SPA routing, gzip, cache) |
| 9 | `rsync build/` → `WEB_ROOT` (if different) |
| 10 | `chown www-data:www-data` on web root |
| 11 | `a2enmod rewrite deflate headers expires` |
| 12 | `systemctl reload apache2` (when `RELOAD_APACHE=1`) |

You do **not** need to run `generate:sitemap`, `generate:seo`, or `npm run build` separately.

## Overrides

```bash
SKIP_PULL=1 SKIP_INSTALL=1 RELOAD_APACHE=1 ./scripts/deploy-ubuntu.sh
```

```bash
APP_DIR=/var/www/html/naasei/projects/360-tour \
WEB_ROOT=/var/www/html/naasei/projects/360-tour/build \
RELOAD_APACHE=1 \
./scripts/deploy-ubuntu.sh
```

## Apache vhost (once)

```apache
DocumentRoot /var/www/html/naasei/projects/360-tour/build
<Directory .../360-tour/build>
    AllowOverride All
    Require all granted
</Directory>
```

```bash
sudo a2enmod rewrite deflate headers expires ssl
```

## After deploy, verify

- https://360toursghana.com/tours
- https://360toursghana.com/sitemap.xml
- https://360toursghana.com/admin/login
