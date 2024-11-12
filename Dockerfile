FROM denoland/deno:alpine

WORKDIR /app

# Cache the dependencies
COPY deno.json .
COPY import_map.json .
RUN deno cache --import-map=import_map.json main.ts

# Copy the rest of the application
COPY . .

# Compile the application
RUN deno task build

# Run the application
CMD ["deno", "task", "start"]

