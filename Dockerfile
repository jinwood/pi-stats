FROM denoland/deno:alpine
WORKDIR /app
# Cache the dependencies
COPY package.json .
COPY import_map.json* .
COPY vite.config.ts* .

COPY src/ src/
COPY public/ public/
COPY tsconfig.json .
COPY index.html .

# install dependencies
RUN deno install
RUN deno task build
# Use nginx to serve the static files
FROM nginx:alpine

# Copy built files to nginx
COPY --from=0 /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80
