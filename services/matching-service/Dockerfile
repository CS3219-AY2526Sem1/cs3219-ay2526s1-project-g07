# Dockerfile for Matching Service
FROM node:20-alpine AS base

FROM base AS builder

RUN apk add --no-cache gcompat

# Set working directory
WORKDIR /app/services/matching-service

# Copy config files first for better caching
COPY services/matching-service/package*.json services/matching-service/tsconfig.json ./
RUN npm ci

# Copy modules
COPY shared /app/shared
COPY redis /app/redis
COPY services/matching-service/src ./src

RUN npm run build

FROM base AS runner
WORKDIR /app/services/matching-service

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Copy built shared and redis packages if they have dist folders
COPY --from=builder --chown=nodejs:nodejs /app/shared /app/shared
COPY --from=builder --chown=nodejs:nodejs /app/redis /app/redis

# Copy package.json for npm scripts
COPY --from=builder --chown=nodejs:nodejs /app/services/matching-service/package.json ./
# Copy application dependencies
COPY --from=builder --chown=nodejs:nodejs /app/services/matching-service/node_modules ./node_modules
# Copy the built application
COPY --from=builder --chown=nodejs:nodejs /app/services/matching-service/dist ./dist

# Expose the port the app runs on
EXPOSE 4000

# Environment variables with defaults
ENV NODE_ENV=production
ENV PORT=4000
ENV HOST_URL=http://localhost:3000
ENV WS_PORT=http://localhost:5000
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379
ENV REDIS_DATABASE_INDEX_MATCHING_SERVICE=0

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = { host: 'localhost', port: process.env.PORT || 4000, path: '/health', timeout: 2000 }; \
    const req = http.request(options, (res) => { \
      if (res.statusCode === 200) process.exit(0); else process.exit(1); \
    }); \
    req.on('error', () => process.exit(1)); \
    req.end();" 2>/dev/null || exit 1

CMD ["npm", "run", "start"]
