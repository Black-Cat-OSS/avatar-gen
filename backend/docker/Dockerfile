# Multi-stage build for optimization
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install system dependencies for Sharp (image processing)
RUN apk add --no-cache \
    vips-dev \
    python3 \
    make \
    g++

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
# Use parallel installation for faster builds
RUN npm ci --prefer-offline --no-audit

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
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Install only runtime dependencies for Sharp
RUN apk add --no-cache \
    vips \
    curl

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Copy configuration files
COPY settings.yaml ./
COPY start.sh ./

# Create storage directories
RUN mkdir -p storage/avatars storage/database

# Don't copy existing database - create fresh one in container
# This avoids permission and cross-platform issues

# Make startup script executable
RUN chmod +x /app/start.sh

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
CMD ["/app/start.sh"]

