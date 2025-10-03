# Gateway Testing

This directory contains integration and load tests for the Nginx gateway reverse
proxy.

## Test Files

### `gateway.test.sh`

Integration tests for gateway functionality:

- Health check
- HTTP to HTTPS redirect
- Frontend proxying
- Backend API proxying
- Custom error pages (404, 403, 5xx)
- SSL certificate validation
- Security headers
- GZIP compression
- Port configuration
- Nginx configuration syntax

### `gateway-load.test.sh`

Load tests for gateway performance:

- Frontend endpoint load testing
- API endpoint load testing
- Connection persistence
- Success rate calculation

## Running Tests

### Prerequisites

Before running tests, ensure:

1. Docker is running
2. All services are started: `./scripts/start.sh`
3. Gateway container is healthy

### Run Integration Tests

```bash
chmod +x gateway/test/gateway.test.sh
./gateway/test/gateway.test.sh
```

### Run Load Tests

```bash
chmod +x gateway/test/gateway-load.test.sh
./gateway/test/gateway-load.test.sh
```

### Run All Gateway Tests

```bash
cd gateway/test
./run-all-tests.sh
```

## Test Configuration

### Integration Tests

- Gateway HTTPS: `https://localhost:12745`
- Gateway HTTP: `http://localhost:80`
- Self-signed SSL certificate is used in development

### Load Tests

- Concurrent requests: 10
- Total requests: 100
- Success threshold: 95%

## Expected Results

### Integration Tests

All 10 tests should pass:

- ✓ Gateway is accessible via HTTPS
- ✓ HTTP redirects to HTTPS
- ✓ Frontend accessible via gateway
- ✓ Backend API accessible via gateway
- ✓ Custom 404 page is served
- ✓ SSL certificate is present
- ✓ Security headers are present
- ✓ GZIP compression is enabled
- ✓ Gateway listening on port 12745
- ✓ Nginx configuration is valid

### Load Tests

- Frontend success rate: ≥95%
- API success rate: ≥95%
- Requests/sec: varies by system

## Troubleshooting

### Gateway Not Accessible

```bash
# Check if gateway container is running
docker ps | grep avatar-gen-gateway

# Check gateway logs
docker logs avatar-gen-gateway

# Check gateway health
docker exec avatar-gen-gateway nginx -t
```

### SSL Certificate Issues

```bash
# Regenerate self-signed certificate
docker exec -u root avatar-gen-gateway sh -c "
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/letsencrypt/live/localhost/privkey.pem \
    -out /etc/letsencrypt/live/localhost/fullchain.pem \
    -subj '/C=US/ST=State/L=City/O=Organization/CN=localhost'
"

# Restart gateway
docker restart avatar-gen-gateway
```

### Port Conflicts

```bash
# Check if ports are already in use
netstat -an | grep -E ":(80|12745)"

# Find process using the port
lsof -i :12745
```

### Backend/Frontend Not Responding

```bash
# Check if services are healthy
docker ps --filter "name=avatar-gen"

# Check backend health
docker exec avatar-gen-backend curl -f http://localhost:3000/api/health

# Check frontend health
docker exec avatar-gen-frontend curl -f http://localhost/health
```

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Gateway Tests
  run: |
    ./scripts/start.sh sqlite &
    sleep 30
    ./gateway/test/run-all-tests.sh
```

## Performance Benchmarks

For more detailed performance testing, consider using:

- Apache Bench: `ab -n 1000 -c 10 https://localhost:12745/`
- wrk: `wrk -t10 -c100 -d30s https://localhost:12745/`
- k6: For comprehensive load testing scenarios

## Security Testing

Additional security tests can be performed using:

- `testssl.sh`: SSL/TLS security scanner
- `nikto`: Web server scanner
- `nmap`: Port and service detection

## Notes

- Tests use `-k` flag with curl to accept self-signed certificates
- Production should use valid SSL certificates from Let's Encrypt
- Load tests may fail if system resources are limited
- Some tests may return 502 if backend/frontend are not fully started
