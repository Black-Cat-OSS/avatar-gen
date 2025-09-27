# Multi-stage build for React + Vite + TypeScript + Nginx
# Stage 1: Build the application
# Using Node.js 22 (matches local version v22.20.0)
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm globally with specific version
# Note: While pnpm loses some advantages in containers (hard links, shared store),
# we use it to maintain consistency with the project's package manager
RUN npm install -g pnpm@8.15.6

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Stage 2: Production image with Nginx
FROM nginx:alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user (www-data group already exists in nginx:alpine)
RUN adduser -S www-data -u 1001 -G www-data

# Nginx configuration will be mounted from host
# COPY configs/nginx/nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy static files (includes custom error pages)
COPY --from=builder /app/static /usr/share/nginx/html/static

# Set proper permissions
RUN chown -R www-data:www-data /usr/share/nginx/html && \
    chown -R www-data:www-data /var/cache/nginx && \
    chown -R www-data:www-data /var/log/nginx && \
    chown -R www-data:www-data /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R www-data:www-data /var/run/nginx.pid

# Switch to non-root user
USER www-data

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
