FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_BACKEND_URL
ARG VITE_BACKEND_WEBSOCKETS_URL

ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_BACKEND_WEBSOCKETS_URL=$VITE_BACKEND_WEBSOCKETS_URL

RUN npm run build

FROM node:24-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 80

CMD ["serve", "-s", "dist", "-l", "80"]