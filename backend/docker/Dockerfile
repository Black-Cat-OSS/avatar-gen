FROM node:20-bullseye AS deps
WORKDIR /app

# Set environment variable to skip husky installation
ENV HUSKY_SKIP_INSTALL=1

# Install pnpm globally
RUN npm install -g pnpm@latest

# Copy workspace configuration and lock files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy backend package files for dependencies installation
COPY backend/package.json ./backend/

# Install dependencies from workspace
RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  curl python3 make g++ libvips-dev && \
  rm -rf /var/lib/apt/lists/* && \
  pnpm install --frozen-lockfile --filter backend...

FROM node:20-bullseye AS builder
WORKDIR /app

# Set environment variable to skip husky installation
ENV HUSKY_SKIP_INSTALL=1

# Install pnpm globally
RUN npm install -g pnpm@latest

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy all dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend ./backend

# Copy backend source files
COPY backend/src ./backend/src
COPY backend/tsconfig.json ./backend/
COPY backend/nest-cli.json ./backend/
COPY backend/vitest.config.*.ts ./backend/
COPY backend/test/ ./backend/test/

# Add node_modules/.bin to PATH for access to binaries
ENV PATH="/app/node_modules/.bin:$PATH"

# Build the backend application
WORKDIR /app/backend
RUN pnpm run build

FROM node:20-bullseye AS test
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@latest

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy all dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend ./backend

# Add node_modules/.bin to PATH for access to binaries
ENV PATH="/app/node_modules/.bin:$PATH"

WORKDIR /app/backend

FROM node:20-bullseye AS production
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@latest

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package.json ./backend/
COPY backend/start.sh ./backend/start.sh

# Copy workspace files for pnpm
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Install production dependencies
RUN pnpm install --frozen-lockfile --filter backend... --prod && \
  chmod +x ./backend/start.sh

WORKDIR /app/backend

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["sh", "/app/start.sh"]