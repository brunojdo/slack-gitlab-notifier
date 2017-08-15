FROM node:8.3.0-alpine

MAINTAINER Bruno Dias <contato@diasbruno.com> 

RUN apk add --no-cache bash \
    && rm -rf /var/cache/apk/* \
    && npm update && npm install -g \
        babel-cli \
        yarn \
    && npm cache clean --force

EXPOSE 8008

ADD ./app /opt/app
WORKDIR /opt/app
RUN yarn
ADD ./docker-entrypoint.sh /opt

CMD ["bash","/opt/docker-entrypoint.sh"]
