# # =====================
# # BUILD STAGE (NODE)
# # =====================
# FROM node:22-alpine AS build

# WORKDIR /app

# COPY package.json package-lock.json* bun.lock* ./
# RUN npm install

# COPY . .
# RUN npm run build


# # =====================
# # RUNTIME STAGE (BUN)
# # =====================
# FROM oven/bun:1-slim

# WORKDIR /app
# ENV NODE_ENV=production

# # 🔥 Jangan install ulang
# COPY --from=build /app/package.json ./package.json
# COPY --from=build /app/node_modules ./node_modules
# COPY --from=build /app/dist ./dist

# EXPOSE 3000

# CMD ["bun", "run", "start"]
# =========================
# 1️⃣ Build Stage
# =========================
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

# ⛔ JANGAN set NODE_ENV=production di sini
RUN npm install

COPY . .

RUN npm run build


# =========================
# 2️⃣ Runtime Stage
# =========================
FROM node:22-alpine

WORKDIR /app

COPY --from=build /app ./

# Production install only runtime deps
RUN npm install --omit=dev

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start"]