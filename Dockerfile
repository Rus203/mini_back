FROM node:20-alpine
WORKDIR /app
COPY . /app

RUN apk add --no-cache openssh git docker-cli
RUN apk add --no-cache py-pip
RUN pip install docker-compose

RUN apk add --no-cache sudo

RUN npm update
RUN npm install
RUN npm install -g nest
RUN npm run build

CMD cd /app/dist && sudo chmod 666 /var/run/docker.sock && npm run start