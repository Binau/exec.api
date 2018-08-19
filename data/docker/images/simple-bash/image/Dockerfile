FROM alpine:3.8

RUN apk add --no-cache sed bash

# Creation du user pour les programmes docker
RUN adduser -DH dockeruser

# Ajout des scripts docker-engine et applicatif
ADD docker-engine ./docker-engine
WORKDIR /docker-engine

# Gestion des droits
RUN chown -R dockeruser:dockeruser /docker-engine
RUN chown -R root:root /docker-engine/bin

RUN chmod -R 777 /docker-engine/app
RUN chmod -R 700 /docker-engine/bin

CMD ["sh"]