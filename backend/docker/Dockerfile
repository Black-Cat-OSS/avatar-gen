FROM node:20-alpine AS installation
WORKDIR /app

COPY package.json .
COPY src .

RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=installation package.json .
COPY --from=installation node_modules .
COPY --from=installation src .
COPY tsconfig.json .
COPY nest-cli.json .

RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app

COPY --from=builder dist .
COPY --from=builder package.json .
COPY --from=builder package-lock.json .
COPY start.sh ./scripts

RUN echo "https://mirror.yandex.ru/mirrors/alpine/v3.22/main" > /etc/apk/repositories && \
  echo "https://mirror.yandex.ru/mirrors/alpine/v3.22/community" >> /etc/apk/repositories && \
  echo "https://dl-cdn.alpinelinux.org/alpine/v3.22/main" >> /etc/apk/repositories && \
  echo "https://dl-cdn.alpinelinux.org/alpine/v3.22/community" >> /etc/apk/repositories && \
  apk update && \
  apk add --no-cache vips-dev python3 make g++ && \
  npm ci --omit=dev &&\
  chmod +x /app/scripts/start.sh

WORKDIR /app/scripts

EXPOSE 3000

ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["./start.sh"]