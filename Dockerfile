FROM oven/bun:latest

WORKDIR /app

RUN apt-get update && apt-get install -y git

COPY package.json bun.lockb* ./
run bun install

COPY . .

RUN bun run build

FROM nginx:alpine

COPY --from=0 /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
