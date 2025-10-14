FROM nginx:alpine

LABEL maintainer="Avatar Generator"
LABEL description="Nginx reverse proxy with Let's Encrypt support"

RUN echo "https://mirror.yandex.ru/mirrors/alpine/v3.22/main" > /etc/apk/repositories && \
    echo "https://mirror.yandex.ru/mirrors/alpine/v3.22/community" >> /etc/apk/repositories || true

RUN for i in 1 2 3; do \
    apk update && apk add --no-cache certbot certbot-nginx openssl bash && break || \
    { echo "Retry $i/3 failed, trying default mirrors..."; \
    echo "https://dl-cdn.alpinelinux.org/alpine/v3.22/main" > /etc/apk/repositories && \
    echo "https://dl-cdn.alpinelinux.org/alpine/v3.22/community" >> /etc/apk/repositories && \
    apk update; sleep 5; }; \
    done && \
    rm -rf /var/cache/apk/* && \
    mkdir -p /var/www/certbot \
    /etc/letsencrypt/live/localhost \
    /usr/share/nginx/html/static \
    /var/log/nginx \
    /var/cache/nginx/client_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp \
    /tmp \
    && chown -R nginx:nginx /var/www/certbot \
    && chown -R nginx:nginx /etc/letsencrypt \
    && chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /tmp \
    && chmod -R 755 /var/cache/nginx \
    && chmod 1777 /tmp

RUN openssl dhparam -out /etc/ssl/dhparam.pem 2048 && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/letsencrypt/live/localhost/privkey.pem \
    -out /etc/letsencrypt/live/localhost/fullchain.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" \
    && chown -R nginx:nginx /etc/letsencrypt

EXPOSE 18650

ENTRYPOINT ["nginx", "-g", "daemon off;"]