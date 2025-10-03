# ---------- Deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---------- Build ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- Runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy package.json for npm scripts
COPY package*.json ./
# Copy the built application
COPY --from=build /app/dist ./dist
RUN npm ci --omit=dev
EXPOSE 5000

# This should be removed in production for an .env file
ENV BETTER_AUTH_SECRET=better_auth_secret

CMD ["npm", "run", "start"]