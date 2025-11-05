FROM redis:latest

WORKDIR /app

COPY redis.conf /usr/local/etc/redis/redis.conf

RUN npm run build

CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
