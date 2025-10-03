# Reverse Proxy Gateway

Nginx-based reverse proxy gateway with SSL/TLS support and load balancing for
Avatar Generator application.

## Overview

The gateway serves as the single entry point for all client requests, routing
traffic to backend API and frontend services with SSL encryption, load
balancing, and security headers.

## Features

- **SSL/TLS Encryption**: HTTPS support with Let's Encrypt integration
- **Load Balancing**: Upstream configuration with least_conn algorithm
- **Reverse Proxy**: Routes `/api` to backend, `/` to frontend
- **Security Headers**: HSTS, X-Frame-Options, CSP, etc.
- **Custom Error Pages**: Styled 404, 403, and 5xx error pages
- **GZIP Compression**: Optimized content delivery
- **Health Checks**: Nginx configuration validation
- **Hot Reload**: Configuration can be reloaded without container restart

## Architecture

```
Client Request
    ↓
Gateway (Nginx) :80, :12745
    ↓
    ├── /api → Backend Service :3000
    └── /    → Frontend Service :80
```

## Configuration

### Ports

- **80**: HTTP (redirects to HTTPS)
- **12745**: HTTPS (primary SSL endpoint)

### Upstream Services

- **backend**: `avatar-backend:3000` (Backend API)
- **frontend**: `avatar-frontend:80` (Frontend application)

### Load Balancing

- Algorithm: `least_conn` (least connections)
- Health checks: `max_fails=3`, `fail_timeout=30s`
- Keep-alive: 32 connections

### SSL/TLS Configuration

Based on Mozilla SSL Configuration Generator (Modern):

- Protocols: TLSv1.3 only
- Session timeout: 1 day
- DH parameters: 2048 bits
- OCSP stapling: Enabled
- Certificate location: `/etc/letsencrypt/live/localhost/`

## Directory Structure

```
gateway/
├── Dockerfile           # Container definition
├── entrypoint.sh       # Initialization script
├── logs/               # Nginx logs (mounted from host)
├── test/               # Gateway tests
└── README.md           # This file

gateway/configs/
├── nginx.conf          # Main Nginx configuration
└── static/             # Static error pages
    ├── 404.html        # Not Found page
    ├── 403.html        # Forbidden page
    └── 50x.html        # Server Error page
```

## Usage

### Build Image

```bash
docker build -t avatar-gen-gateway gateway/
```

### Run Container

```bash
docker run -d \
  --name avatar-gen-gateway \
  -p 80:80 \
  -p 12745:12745 \
  -v $(pwd)/gateway/configs/nginx.conf:/etc/nginx/nginx.conf:ro \
  -v $(pwd)/gateway/configs/static:/usr/share/nginx/html/static:ro \
  -v $(pwd)/gateway/logs:/var/log/nginx \
  avatar-gen-gateway
```

### Using Docker Compose

```bash
# Start with SQLite
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.sqlite.yml up

# Start with PostgreSQL
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.postgresql.yml --profile postgresql up
```

## Configuration Reload

To apply configuration changes without downtime:

```bash
# Test configuration
docker exec avatar-gen-gateway nginx -t

# Reload configuration
docker exec avatar-gen-gateway nginx -s reload
```

## SSL Certificate Management

### Self-Signed Certificate (Development)

Generated automatically on container start:

```bash
docker exec -u root avatar-gen-gateway sh -c "
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/letsencrypt/live/localhost/privkey.pem \
    -out /etc/letsencrypt/live/localhost/fullchain.pem \
    -subj '/C=US/ST=State/L=City/O=Organization/CN=localhost'
"
```

### Let's Encrypt Certificate (Production)

```bash
# Request certificate
docker exec avatar-gen-gateway certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email your@email.com \
  --agree-tos \
  --no-eff-email

# Reload nginx after certificate issuance
docker exec avatar-gen-gateway nginx -s reload
```

### Auto-Renewal

Add to crontab:

```bash
0 12 * * * docker exec avatar-gen-gateway certbot renew --quiet && docker exec avatar-gen-gateway nginx -s reload
```

## Security

### User Permissions

- Container runs as non-root user: `nginx`
- Minimal permissions: read-only configuration
- Isolated network namespace

### Security Headers

- `Strict-Transport-Security`: Forces HTTPS
- `X-Frame-Options`: Prevents clickjacking
- `X-Content-Type-Options`: Prevents MIME sniffing
- `X-XSS-Protection`: XSS protection
- `Referrer-Policy`: Controls referrer information

### Network Configuration

- Listens on: `0.0.0.0` (all interfaces)
- IPv4 and IPv6 support
- Isolated Docker network: `avatar-gen-network`

## Monitoring

### Access Logs

```bash
# View access logs
docker exec avatar-gen-gateway tail -f /var/log/nginx/access.log

# View from host
tail -f gateway/logs/access.log
```

### Error Logs

```bash
# View error logs
docker exec avatar-gen-gateway tail -f /var/log/nginx/error.log

# View from host
tail -f gateway/logs/error.log
```

### Health Check

```bash
# Check nginx status
docker exec avatar-gen-gateway nginx -t

# Check if nginx is running
docker exec avatar-gen-gateway ps aux | grep nginx
```

## Troubleshooting

### Gateway Not Starting

```bash
# Check logs
docker logs avatar-gen-gateway

# Check configuration
docker exec avatar-gen-gateway nginx -t

# Verify permissions
docker exec avatar-gen-gateway ls -la /etc/nginx/nginx.conf
```

### SSL Certificate Issues

```bash
# Check certificate
docker exec avatar-gen-gateway openssl x509 -in /etc/letsencrypt/live/localhost/fullchain.pem -text -noout

# Regenerate self-signed certificate
docker exec -u root avatar-gen-gateway sh -c "rm -rf /etc/letsencrypt/live/localhost/*"
docker restart avatar-gen-gateway
```

### Proxy Errors (502 Bad Gateway)

```bash
# Check if backend is accessible
docker exec avatar-gen-gateway wget -O- http://avatar-backend:3000/api/health

# Check if frontend is accessible
docker exec avatar-gen-gateway wget -O- http://avatar-frontend:80/health

# Verify network
docker network inspect avatar-gen-network
```

### Port Conflicts

```bash
# Check what's using ports
netstat -an | grep -E ":(80|12745)"
lsof -i :12745

# Use alternative ports (modify docker-compose.yml)
ports:
  - "8080:80"
  - "8443:12745"
```

## Testing

Run gateway tests:

```bash
# Integration tests
./gateway/test/gateway.test.sh

# Load tests
./gateway/test/gateway-load.test.sh

# All gateway tests
./gateway/test/run-all-tests.sh
```

See [gateway/test/README.md](test/README.md) for detailed testing documentation.

## Performance Tuning

### Worker Processes

```nginx
worker_processes auto;  # One per CPU core
```

### Worker Connections

```nginx
worker_connections 1024;  # Adjust based on load
```

### Keepalive

```nginx
keepalive_timeout 65;
upstream backend {
    keepalive 32;  # Connection pool size
}
```

### Buffer Sizes

```nginx
client_max_body_size 10M;  # Max upload size
proxy_buffers 8 16k;
proxy_buffer_size 32k;
```

## Production Recommendations

1. **Use Valid SSL Certificates**: Replace self-signed with Let's Encrypt
2. **Enable OCSP Stapling**: For better SSL performance
3. **Configure Rate Limiting**: Prevent abuse
4. **Enable Access Log Rotation**: Prevent disk space issues
5. **Monitor Resource Usage**: CPU, memory, connections
6. **Set Up Alerts**: For downtime and errors
7. **Regular Updates**: Keep nginx and Alpine Linux updated
8. **Backup Configuration**: Store nginx.conf in version control

## References

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Docker Nginx Image](https://hub.docker.com/_/nginx)
