FROM node:20-bullseye AS deps
WORKDIR /app

COPY ../package.json .

RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  curl python3 make g++ libvips-dev && \
  rm -rf /var/lib/apt/lists/* && \
  npm install

FROM node:20-bullseye AS builder
WORKDIR /app

COPY --from=deps /app/node_modules node_modules
COPY --from=deps /app/package*.json .
COPY ../src ./src
COPY ../tsconfig.json .
COPY ../nest-cli.json .

RUN npm run build && \
  rm -rf ./node_modules && \
  rm -rf ./src && \
  rm ./tsconfig.json && \
  rm ./nest-cli.json

FROM node:20-bullseye AS production
WORKDIR /app

COPY --from=builder /app/dist dist
COPY --from=builder /app/package*.json .
COPY ../start.sh /app/start.sh

RUN npm ci && \
  chmod +x /app/start.sh

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["sh", "/app/start.sh"]