FROM node:20-alpine
WORKDIR /app
COPY . /app
RUN cd /app
RUN apk add --no-cache openssh
RUN apk add git
RUN apk add docker && apk add docker-compose
RUN apk add sudo
RUN npm update
RUN npm i
RUN npm i -g nest
RUN npm run build
CMD cd /app/dist && sudo chmod 666 /var/run/docker.sock && npm run start