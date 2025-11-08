FROM redis:latest
COPY redis.conf /usr/local/etc/redis/redis.conf

LABEL org.opencontainers.image.source=https://github.com/CS3219-AY2526Sem1/cs3219-ay2526s1-project-g07
LABEL org.opencontainers.image.description="CS3219 AY2526S1 Project G07 PeerPrep Redis Service"

CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
