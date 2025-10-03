FROM nginx:alpine

LABEL maintainer="Avatar Generator"
LABEL description="Nginx reverse proxy with Let's Encrypt support"

RUN apk add --no-cache \
    certbot \
    certbot-nginx \
    openssl \
    bash \
    && rm -rf /var/cache/apk/*

RUN mkdir -p /var/www/certbot \
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

RUN openssl dhparam -out /etc/ssl/dhparam.pem 2048

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/letsencrypt/live/localhost/privkey.pem \
    -out /etc/letsencrypt/live/localhost/fullchain.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" \
    && chown -R nginx:nginx /etc/letsencrypt

COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 80 12745

STOPSIGNAL SIGQUIT

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

