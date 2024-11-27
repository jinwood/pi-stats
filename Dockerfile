FROM denoland/deno:alpine as builder
WORKDIR /app
# Cache the dependencies
COPY . .
# install dependencies
RUN deno install
RUN deno task build
# Use nginx to serve the static files
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Expose port 80
EXPOSE 80
