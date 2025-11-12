# AI Assistance Disclosure:
# Tool: GitHub Copilot (model: claude-sonnet-4.5), date: 2025-10-04
# Scope: Generated Dockerfile steps for nginx setup and container healthchecks.
# Author review: I validated correctness after building and running the container.

# Dockerfile Reference: https://www.docker.com/blog/how-to-use-the-official-nginx-docker-image/

FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable

# Copy config files first for better caching
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile

# Copy shared folder from root (build context must be root directory)
COPY shared ../shared

# Copy application files
COPY frontend/biome.json frontend/components.json frontend/postcss.config.mjs frontend/rsbuild.config.ts frontend/tsconfig.json ./
COPY frontend/components ./components/
COPY frontend/lib ./lib/
COPY frontend/src ./src/

# Builds the project and prunes dev dependencies
RUN pnpm run build

FROM nginx:1.29-alpine-slim

LABEL org.opencontainers.image.source=https://github.com/CS3219-AY2526Sem1/cs3219-ay2526s1-project-g07
LABEL org.opencontainers.image.description="CS3219 AY2526S1 Project G07 PeerPrep Frontend"

# Copy nginx config
COPY frontend/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built application
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
