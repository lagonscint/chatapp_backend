# Stage 1: Build
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Run
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3000
USER node
CMD ["node", "server.js"]