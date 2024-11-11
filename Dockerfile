FROM oven/bun:latest as builder
WORKDIR /app
COPY . .
RUN bun install
RUN bun run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
