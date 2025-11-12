# Dockerfile Source: https://hono.dev/docs/getting-started/nodejs#building-deployment
FROM node:22-alpine AS base

FROM base AS builder

RUN apk add --no-cache gcompat
WORKDIR /app

# Copy config files first for better caching
COPY package.json pnpm-lock.yaml tsconfig.json ./
RUN corepack enable && pnpm i --frozen-lockfile

COPY src ./src/

# Builds the project
RUN pnpm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

LABEL org.opencontainers.image.source=https://github.com/CS3219-AY2526Sem1/cs3219-ay2526s1-project-g07
LABEL org.opencontainers.image.description="CS3219 AY2526S1 Project G07 PeerPrep Collaboration Service"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

# Copy package.json and lockfile for installing dependencies
COPY --from=builder --chown=hono:nodejs /app/package.json /app/package.json
COPY --from=builder --chown=hono:nodejs /app/pnpm-lock.yaml /app/pnpm-lock.yaml

# Install only production dependencies
RUN corepack enable && pnpm install --prod --frozen-lockfile

# Copy the built application
COPY --from=builder --chown=hono:nodejs /app/dist /app/dist

USER hono
EXPOSE 5004

CMD ["pnpm", "start"]
