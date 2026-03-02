# =====================
# BUILD STAGE (NODE)
# =====================
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* bun.lock* ./
RUN npm install

COPY . .
RUN npm run build


# =====================
# PRODUCTION STAGE (BUN)
# =====================
FROM oven/bun:1-slim

WORKDIR /app
ENV NODE_ENV=production

# copy package.json saja (tanpa dev deps)
COPY --from=build /app/package.json ./
COPY --from=build /app/bun.lock ./

# install production deps pakai bun
RUN bun install --production --frozen-lockfile

# copy hasil build saja
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist/server/server.js ./server.js

EXPOSE 3000

CMD ["bun", "run", "start"]