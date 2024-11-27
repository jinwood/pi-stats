FROM denoland/deno:alpine
WORKDIR /app
# Cache the dependencies
COPY package.json .
COPY deno.json .
COPY import_map.json* .
COPY vite.config.ts* .

COPY src/ src/
COPY public/ public/
COPY tsconfig.json .
COPY index.html .

# install dependencies
RUN deno install

RUN deno cache --import-map=import_map.json main.ts
# Copy the rest of the application
COPY . .
# Compile the application
RUN deno task build
# Expose port
EXPOSE 8000
# Run the application
CMD ["deno", "task", "start"]

