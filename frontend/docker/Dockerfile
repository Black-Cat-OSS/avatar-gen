# Multi-stage build for React + Vite + TypeScript + Nginx
# Stage 1: Install dependencies
# Using Node.js 22 (matches local version v22.20.0)
FROM node:22-alpine AS dependencies

# Set working directory
WORKDIR /app

# Set environment variable to skip husky installation
ENV HUSKY_SKIP_INSTALL=1

# Install pnpm globally
RUN npm install -g pnpm@latest

# Copy workspace configuration and lock files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy frontend package files for dependencies installation
COPY frontend/package.json ./frontend/
COPY frontend/pnpm-lock.yaml ./frontend/

# Install dependencies from workspace
# Note: HUSKY_SKIP_INSTALL=1 prevents husky installation and prepare script execution
RUN pnpm install --frozen-lockfile --filter react-sdk...

# Stage 2: Build the application
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@latest

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy all dependencies from previous stage (including dev dependencies needed for build)
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/frontend ./frontend

# Copy frontend source files
COPY frontend/package.docker.json ./frontend/package.json
COPY frontend/index.html ./frontend/
COPY frontend/src ./frontend/src/
COPY frontend/public ./frontend/public/
COPY frontend/static ./frontend/static/
COPY frontend/plugins ./frontend/plugins/
COPY frontend/vite.config.ts ./frontend/
COPY frontend/tsconfig.json ./frontend/
COPY frontend/tsconfig.app.json ./frontend/
COPY frontend/tsconfig.node.json ./frontend/
COPY frontend/tailwind.config.ts ./frontend/

# Copy environment files (Vite will use .env and .env.production during build)
COPY frontend/.env ./frontend/.env
COPY frontend/.env.production ./frontend/.env.production

# Add node_modules/.bin to PATH for access to binaries like tsc and vite
ENV PATH="/app/node_modules/.bin:$PATH"

# Build the application
WORKDIR /app/frontend
RUN pnpm run build

# Stage 3: Production image with Nginx
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
COPY frontend/configs/nginx/nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy static files (includes custom error pages)
COPY --from=builder /app/frontend/static /usr/share/nginx/html/static

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
