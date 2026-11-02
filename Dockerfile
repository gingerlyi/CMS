# 1) PHP dependencies (production only)
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction
COPY . .
RUN composer dump-autoload --no-dev --optimize --no-scripts

# 2) Runtime: PHP-FPM + Nginx on port 8080 (serversideup/php, made for Laravel)
# public/build comes prebuilt from the laptop (npm run build): npm + vite exhaust the server's 1.7 GB of RAM.
FROM serversideup/php:8.3-fpm-nginx
ENV PHP_OPCACHE_ENABLE=1 \
    PHP_UPLOAD_MAX_FILE_SIZE=10M \
    PHP_POST_MAX_SIZE=12M \
    # On every start: storage:link, migrate --force, and config/route/view caches
    AUTORUN_ENABLED=true
COPY --chown=www-data:www-data . /var/www/html
COPY --from=vendor --chown=www-data:www-data /app/vendor /var/www/html/vendor
RUN test -f /var/www/html/public/build/manifest.json
