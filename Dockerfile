# =====================
# STAGE 1: BUILD (NODE)
# =====================
FROM node:22-alpine AS build

WORKDIR /app

# Install deps
COPY package.json bun.lock ./
RUN npm install

# Copy source
COPY . .

# Build React SSR
RUN npm run build


# =====================
# STAGE 2: RUNTIME (BUN)
# =====================
FROM oven/bun:1

WORKDIR /app
ENV NODE_ENV=production

# Copy runtime deps
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules

# Copy build output
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["bun", "run", "start"]
