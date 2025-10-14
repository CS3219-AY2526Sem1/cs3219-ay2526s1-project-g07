# Dockerfile Source: https://hono.dev/docs/getting-started/nodejs#building-deployment
FROM node:22-alpine AS base

FROM base AS builder

RUN apk add --no-cache gcompat
WORKDIR /app

# Copy config files first for better caching
COPY package*json tsconfig.json ./
RUN npm install

COPY src ./src/

# Builds the project and prunes dev dependencies
RUN npm run build && \
  npm prune --production

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

# Copy package.json for npm scripts
COPY --from=builder --chown=hono:nodejs /app/package.json /app/package.json
# Copy application dependencies
COPY --from=builder --chown=hono:nodejs /app/node_modules /app/node_modules
# Copy the built application
COPY --from=builder --chown=hono:nodejs /app/dist /app/dist

USER hono
EXPOSE 5002

CMD ["npm", "run", "start"]
