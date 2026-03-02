# =====================
# BUILD STAGE
# =====================
FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# =====================
# PRODUCTION STAGE
# =====================
FROM oven/bun:1-slim

WORKDIR /app
ENV NODE_ENV=production

# hanya copy yang perlu
COPY --from=build /app/package.json ./
COPY --from=build /app/bun.lockb ./
RUN bun install --production --frozen-lockfile

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["bun", "run", "start"]