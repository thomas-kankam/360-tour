# Frontend deploy (Ubuntu + Apache)

From the **360-tour** repo root on the server:

```bash
chmod +x scripts/deploy-ubuntu.sh
./scripts/deploy-ubuntu.sh
```

## What the script does

1. `git pull` (branch `main`, override with `BRANCH=`)
2. Loads `.env.production`
3. `npm ci` (or `npm install`)
4. `npm run build` — includes SEO assets + `sitemap.xml` (via `prebuild`)
5. Writes Apache `.htaccess` (SPA routing, gzip, cache headers) into `build/`
6. Optionally `rsync` to `WEB_ROOT` if different from `build/`
7. `chown www-data:www-data` on web root
8. `a2enmod rewrite deflate headers expires` (if available)
9. Reload Apache when `RELOAD_APACHE=1`

## Common overrides

```bash
APP_DIR=/var/www/html/naasei/projects/360-tour \
WEB_ROOT=/var/www/html/naasei/projects/360-tour/build \
RELOAD_APACHE=1 \
./scripts/deploy-ubuntu.sh
```

Skip git or npm when already up to date:

```bash
SKIP_PULL=1 SKIP_INSTALL=1 RELOAD_APACHE=1 ./scripts/deploy-ubuntu.sh
```

## Apache vhost (once)

```apache
<VirtualHost *:443>
    ServerName 360toursghana.com
    DocumentRoot /var/www/html/naasei/projects/360-tour/build

    <Directory /var/www/html/naasei/projects/360-tour/build>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

```bash
sudo a2enmod rewrite deflate headers expires ssl
sudo systemctl reload apache2
```
