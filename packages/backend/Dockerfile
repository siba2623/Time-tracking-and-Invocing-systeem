# Multi-stage Dockerfile for packages/backend
FROM node:20-alpine AS builder
WORKDIR /app

# Copy backend package files
COPY packages/backend/package*.json ./
COPY packages/backend/tsconfig.json ./
COPY packages/backend/prisma ./prisma
COPY packages/backend/src ./src

# Install deps and build
RUN npm install
RUN npm run build

# Final image with only production deps and build output
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY packages/backend/package*.json ./

# Install only production dependencies
RUN npm install --production

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node","dist/index.js"]
