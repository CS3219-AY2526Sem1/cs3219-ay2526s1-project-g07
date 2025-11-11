FROM node:20-alpine AS base

FROM base AS builder
# Set working directory
WORKDIR /app

RUN apk add --no-cache gcompat

# Copy Redis source files
COPY redis.conf package.json package-lock.json tsconfig.json ./

# Install dependencies
RUN npm ci
RUN npm dedupe 

# Build the project
COPY src ./src
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache redis

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Copy Redis config and built files
COPY --from=builder --chown=nodejs:nodejs /app/redis.conf ./redis.conf
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
EXPOSE 6379

LABEL org.opencontainers.image.source=https://github.com/CS3219-AY2526Sem1/cs3219-ay2526s1-project-g07
LABEL org.opencontainers.image.description="CS3219 AY2526S1 Project G07 PeerPrep Redis Service"

CMD ["redis-server", "--appendonly", "yes"]
