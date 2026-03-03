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
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* bun.lock* ./
RUN npm install

COPY . .
RUN npm run build


FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

EXPOSE 3000

# CMD ["npm", "run", "start"]
CMD ["node", "dist/server/server.js"]