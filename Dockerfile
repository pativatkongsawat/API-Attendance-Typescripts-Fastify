FROM node:18-alpine AS builder

WORKDIR /app


RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  && npm install -g npm

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build


FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3000
CMD ["node", "dist/app.js"]
