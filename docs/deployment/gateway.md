# Gateway Deployment

## Overview

The Avatar Generator uses an Nginx-based reverse proxy gateway as the single
entry point for all client requests. The gateway provides SSL/TLS encryption,
load balancing, and routes traffic to backend and frontend services.

## Architecture

```
Internet
    ↓
Nginx Gateway (Port 80, 12745)
    ↓
    ├── /api/* → Backend Service (Port 3000)
    └── /*     → Frontend Service (Port 80)
```

## Features

- **SSL/TLS Termination**: HTTPS on port 12745 with Let's Encrypt support
- **HTTP to HTTPS Redirect**: Automatic redirect from port 80 to 12745
- **Load Balancing**: Least connections algorithm for optimal distribution
- **Security Headers**: HSTS, X-Frame-Options, CSP, etc.
- **Custom Error Pages**: Styled 404, 403, and 5xx pages
- **GZIP Compression**: Optimized bandwidth usage
- **Health Checks**: Automatic backend health monitoring

## Deployment Options

### Option 1: Docker Compose (Recommended)

#### With SQLite

```bash
# Build images
./scripts/build.sh sqlite

# Start services
./scripts/start.sh sqlite
```

#### With PostgreSQL

```bash
# Build images
./scripts/build.sh postgresql

# Start services
./scripts/start.sh postgresql
```

### Option 2: Manual Docker

```bash
# Build gateway image
docker build -t avatar-gen-gateway gateway/

# Create network
docker network create avatar-gen-network

# Run gateway
docker run -d \
  --name avatar-gen-gateway \
  --network avatar-gen-network \
  -p 80:80 \
  -p 12745:12745 \
  -v $(pwd)/gateway/configs/nginx.conf:/etc/nginx/nginx.conf:ro \
  -v $(pwd)/gateway/configs/static:/usr/share/nginx/html/static:ro \
  -v $(pwd)/gateway/logs:/var/log/nginx \
  avatar-gen-gateway
```

## Configuration

### Nginx Configuration

The main configuration file is located at `gateway/configs/nginx.conf`.

Key sections:

- **Upstream Servers**: Backend and frontend service definitions
- **HTTP Server**: Handles HTTP requests and redirects to HTTPS
- **HTTPS Server**: Main SSL server on port 12745
- **Location Blocks**: Route rules for /api and /

### SSL Certificates

#### Development (Self-Signed)

Automatically generated on container start:

- Certificate: `/etc/letsencrypt/live/localhost/fullchain.pem`
- Private Key: `/etc/letsencrypt/live/localhost/privkey.pem`

#### Production (Let's Encrypt)

1. **Initial Setup**:

```bash
docker exec avatar-gen-gateway certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email your@email.com \
  --agree-tos
```

2. **Auto-Renewal** (crontab):

```bash
0 12 * * * docker exec avatar-gen-gateway certbot renew --quiet && \
           docker exec avatar-gen-gateway nginx -s reload
```

### Environment Variables

No environment variables required for the gateway itself, but upstream services
should be configured:

```yaml
services:
  gateway:
    environment:
      - NGINX_WORKER_PROCESSES=auto
      - NGINX_WORKER_CONNECTIONS=1024
```

## Monitoring

### Health Checks

Gateway health check runs every 30 seconds:

```bash
# Manual health check
docker exec avatar-gen-gateway nginx -t
```

### Logs

#### Access Logs

```bash
# View access logs
tail -f gateway/logs/access.log

# Or from container
docker exec avatar-gen-gateway tail -f /var/log/nginx/access.log
```

#### Error Logs

```bash
# View error logs
tail -f gateway/logs/error.log

# Or from container
docker exec avatar-gen-gateway tail -f /var/log/nginx/error.log
```

### Metrics

Monitor these metrics for optimal performance:

- Request rate (requests/second)
- Response time (average, p95, p99)
- Error rate (4xx, 5xx)
- Active connections
- SSL handshake time

## Testing

### Run Gateway Tests

```bash
# Integration tests
./gateway/test/gateway.test.sh

# Load tests
./gateway/test/gateway-load.test.sh

# All gateway tests
./gateway/test/run-all-tests.sh
```

See [gateway/test/README.md](../../gateway/test/README.md) for detailed testing
documentation.

### Manual Testing

```bash
# Test HTTPS endpoint
curl -k https://localhost:12745/

# Test API proxy
curl -k https://localhost:12745/api/health

# Test HTTP redirect
curl -I http://localhost/

# Test custom error page
curl -k https://localhost:12745/nonexistent
```

## Security

### Best Practices

1. **Use Valid SSL Certificates**: Replace self-signed certificates in
   production
2. **Keep Updated**: Regularly update nginx and Alpine base image
3. **Restrict Access**: Use firewall rules to limit access
4. **Monitor Logs**: Set up alerts for suspicious activity
5. **Rate Limiting**: Configure rate limits to prevent abuse
6. **DDoS Protection**: Use CloudFlare or similar services

### Security Headers

The gateway enforces these security headers:

- `Strict-Transport-Security`: Forces HTTPS for 2 years
- `X-Frame-Options: SAMEORIGIN`: Prevents clickjacking
- `X-Content-Type-Options: nosniff`: Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block`: XSS protection
- `Referrer-Policy: no-referrer-when-downgrade`: Controls referrer

### Network Security

- Runs as non-root user (`nginx`)
- Minimal permissions (read-only configuration)
- Isolated Docker network
- No direct port exposure of backend/frontend

## Troubleshooting

### Gateway Not Starting

```bash
# Check logs
docker logs avatar-gen-gateway

# Verify configuration
docker exec avatar-gen-gateway nginx -t

# Check if ports are available
netstat -an | grep -E ":(80|12745)"
```

### 502 Bad Gateway

```bash
# Check if backend is running
docker ps | grep avatar-gen-backend
curl http://localhost:3000/api/health

# Check if frontend is running
docker ps | grep avatar-gen-frontend

# Verify network connectivity
docker exec avatar-gen-gateway ping avatar-backend
docker exec avatar-gen-gateway ping avatar-frontend
```

### SSL Certificate Errors

```bash
# Check certificate validity
docker exec avatar-gen-gateway openssl x509 \
  -in /etc/letsencrypt/live/localhost/fullchain.pem \
  -text -noout

# Regenerate self-signed certificate
docker exec -u root avatar-gen-gateway sh -c "
  rm -rf /etc/letsencrypt/live/localhost/*
"
docker restart avatar-gen-gateway
```

### Configuration Changes Not Applied

```bash
# Validate configuration
docker exec avatar-gen-gateway nginx -t

# Reload configuration
docker exec avatar-gen-gateway nginx -s reload

# If reload fails, restart container
docker restart avatar-gen-gateway
```

## Performance Tuning

### Worker Configuration

```nginx
worker_processes auto;  # One per CPU core
worker_connections 1024;  # Adjust based on load
```

### Caching

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;
proxy_cache my_cache;
proxy_cache_valid 200 1h;
```

### Connection Pooling

```nginx
upstream backend {
    keepalive 32;  # Connection pool
}
```

## Scaling

### Horizontal Scaling

Add more backend/frontend instances:

```yaml
services:
  avatar-backend:
    deploy:
      replicas: 3

  avatar-frontend:
    deploy:
      replicas: 2
```

Nginx will automatically load balance across all instances.

### Vertical Scaling

Increase resources for gateway container:

```yaml
services:
  gateway:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
```

## Migration Guide

### From Direct Access to Gateway

1. Update client applications to use gateway URL
2. Update backend to trust proxy headers
3. Update frontend environment variables
4. Test all endpoints through gateway
5. Redirect old URLs to new gateway endpoints

## References

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Mozilla SSL Config](https://ssl-config.mozilla.org/)
- [Let's Encrypt Docs](https://letsencrypt.org/docs/)
- [Docker Networking](https://docs.docker.com/network/)
