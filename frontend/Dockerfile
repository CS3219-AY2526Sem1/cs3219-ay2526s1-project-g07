# AI Assistance Disclosure:
# Tool: GitHub Copilot (model: claude-sonnet-4.5), date: 2025‑10-04
# Scope: Generated Dockerfile steps for nginx setup and container healthchecks.
# Author review: I validated correctness after building and running the container.

# Dockerfile Reference: https://www.docker.com/blog/how-to-use-the-official-nginx-docker-image/

FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable

# Copy config files first for better caching
COPY package.json pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile

# Copy application files
COPY biome.json components.json postcss.config.mjs rsbuild.config.ts tsconfig.json ./
COPY components ./components/
COPY lib ./lib/
COPY src ./src/

# Builds the project and prunes dev dependencies
RUN pnpm run build

FROM nginx:1.29.1-alpine-slim

# Copy nginx config
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built application
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
