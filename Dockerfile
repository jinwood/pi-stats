FROM oven/bun:latest as builder

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN bun install

# Build the app
COPY . .
RUN bun run build

# Use official nginx image
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Use default nginx config for now
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
