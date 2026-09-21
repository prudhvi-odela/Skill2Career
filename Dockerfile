# Multi-stage Docker build for Skill2Career Fullstack Backend & Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./
RUN npm install

# Copy source code and build production assets
COPY . .
ENV NODE_ENV=production
RUN npm run build

# Production runner image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled frontend and bundled backend server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/package.json ./package.json

# Expose server port (Render & Docker PaaS detect EXPOSE for port binding)
EXPOSE 3000

# Health check against the health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

# Launch the unified server
CMD ["node", "dist/server.cjs"]
