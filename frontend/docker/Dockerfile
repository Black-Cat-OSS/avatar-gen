# Multi-stage build for React + Vite + TypeScript + Nginx
# Stage 1: Install dependencies
# Using Node.js 22 (matches local version v22.20.0)
FROM node:22-alpine AS dependencies

# Set working directory
WORKDIR /app

# Set environment variable to skip husky installation
ENV HUSKY_SKIP_INSTALL=1

# Install npm globally (already included in node image)

# Copy original package.json for dependencies installation
COPY package.json ./

# Install dependencies from the original package.json
# Note: HUSKY_SKIP_INSTALL=1 prevents husky installation and prepare script execution
RUN npm install --legacy-peer-deps && \
    npm install -g typescript --legacy-peer-deps

# Stage 2: Build the application
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy all dependencies from previous stage (including dev dependencies needed for build)
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package-lock.json ./package-lock.json

# Replace package.json with clean version without husky prepare script
COPY package.docker.json ./package.json

# Add node_modules/.bin to PATH for access to binaries like tsc and vite
ENV PATH="/app/node_modules/.bin:$PATH"

# Copy environment files (Vite will use .env and .env.production during build)
COPY .env ./.env
COPY .env.production ./.env.production

# Copy necessary files for build
COPY index.html ./
COPY src ./src/
COPY public ./public/
COPY static ./static/
COPY plugins ./plugins/
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.app.json ./
COPY tsconfig.node.json ./
COPY tailwind.config.ts ./

# Build the application
RUN npm run build

# Stage 2: Production image with Nginx
FROM nginx:alpine AS production

# Use alternative Alpine mirrors if default is unavailable
RUN echo "https://mirror.yandex.ru/mirrors/alpine/v3.22/main" > /etc/apk/repositories && \
    echo "https://mirror.yandex.ru/mirrors/alpine/v3.22/community" >> /etc/apk/repositories || true

# Install curl for healthcheck with retry logic for network issues
RUN for i in 1 2 3; do \
        apk update && apk add --no-cache curl && break || \
        { echo "Retry $i/3 failed, trying default mirrors..."; \
          echo "https://dl-cdn.alpinelinux.org/alpine/v3.22/main" > /etc/apk/repositories && \
          echo "https://dl-cdn.alpinelinux.org/alpine/v3.22/community" >> /etc/apk/repositories && \
          apk update; sleep 5; }; \
    done

# Create non-root user (www-data group already exists in nginx:alpine)
RUN adduser -S www-data -u 1001 -G www-data || true

# Copy custom nginx configuration
COPY configs/nginx/nginx.conf /etc/nginx/nginx.conf

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
    CMD curl -f http://localhost:8080/ || exit 1

# Start nginx (Nginx handles signals correctly without init system)
CMD ["nginx", "-g", "daemon off;"]
