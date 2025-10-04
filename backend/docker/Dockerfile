# Multi-stage build for optimization
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Use alternative Alpine mirrors if default is unavailable
RUN echo "https://mirror.yandex.ru/mirrors/alpine/v3.22/main" > /etc/apk/repositories && \
    echo "https://mirror.yandex.ru/mirrors/alpine/v3.22/community" >> /etc/apk/repositories || true

# Install system dependencies for Sharp (image processing) with retry logic
RUN for i in 1 2 3; do \
        apk update && apk add --no-cache vips-dev python3 make g++ && break || \
        { echo "Retry $i/3 failed, trying default mirrors..."; \
          echo "https://dl-cdn.alpinelinux.org/alpine/v3.22/main" > /etc/apk/repositories && \
          echo "https://dl-cdn.alpinelinux.org/alpine/v3.22/community" >> /etc/apk/repositories && \
          apk update; sleep 5; }; \
    done

# Set environment variable to skip husky installation
ENV HUSKY_SKIP_INSTALL=1

# Copy package files first for better caching
COPY package*.json ./
COPY package-lock.json ./

# Install ALL dependencies (including devDependencies for build)
# Use installation for faster builds
RUN npm install

# Copy source code and Prisma schema
COPY src ./src
COPY prisma ./prisma
COPY tsconfig.json ./
COPY nest-cli.json ./

# Generate Prisma client
RUN npx prisma generate

# Build the application with parallel compilation
# Set max old space size for large builds and enable parallel compilation
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm install -g typescript && \ 
    npm run build

# Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Use alternative Alpine mirrors if default is unavailable
RUN echo "https://mirror.yandex.ru/mirrors/alpine/v3.22/main" > /etc/apk/repositories && \
    echo "https://mirror.yandex.ru/mirrors/alpine/v3.22/community" >> /etc/apk/repositories || true

# Install only runtime dependencies for Sharp with retry logic
RUN for i in 1 2 3; do \
        apk update && apk add --no-cache vips curl && break || \
        { echo "Retry $i/3 failed, trying default mirrors..."; \
          echo "https://dl-cdn.alpinelinux.org/alpine/v3.22/main" > /etc/apk/repositories && \
          echo "https://dl-cdn.alpinelinux.org/alpine/v3.22/community" >> /etc/apk/repositories && \
          apk update; sleep 5; }; \
    done

# Copy package files
COPY package*.json ./
COPY package-lock.json ./

# Install only production dependencies
RUN npm install --omit=dev && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Create storage directories
RUN mkdir -p storage/avatars storage/database

# Copy startup script only (конфигурации монтируются через volumes)
COPY start.sh ./start.sh

# Don't copy configuration files - they should be mounted as volumes
# Don't copy existing database - create fresh one in container
# This avoids permission and cross-platform issues

# Make startup script executable
RUN chmod +x /app/start.sh && ls -la /app/start.sh

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV DATABASE_URL="file:./storage/database/database.sqlite"
ENV CONFIG_PATH="./settings.yaml"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
# Use sh explicitly to avoid issues with node's docker-entrypoint
CMD ["sh", "/app/start.sh"]

