#!/bin/bash
set -e

echo "Starting nginx gateway..."

echo "Creating cache directories..."
mkdir -p /var/cache/nginx/client_temp \
         /var/cache/nginx/proxy_temp \
         /var/cache/nginx/fastcgi_temp \
         /var/cache/nginx/uwsgi_temp \
         /var/cache/nginx/scgi_temp \
         /tmp/nginx

chmod -R 755 /var/cache/nginx
chmod 1777 /tmp /tmp/nginx

if [ ! -f /etc/letsencrypt/live/localhost/fullchain.pem ]; then
    echo "Generating self-signed certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/letsencrypt/live/localhost/privkey.pem \
        -out /etc/letsencrypt/live/localhost/fullchain.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
fi

if [ ! -f /etc/ssl/dhparam.pem ]; then
    echo "Generating dhparam..."
    openssl dhparam -out /etc/ssl/dhparam.pem 2048
fi

echo "Testing nginx configuration..."
nginx -t

echo "Starting nginx..."
exec "$@"

