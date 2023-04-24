FROM node:20-alpine
WORKDIR /app
COPY . /app
RUN cd /app
RUN npm i
RUN npm i -g nest
RUN npm run build
CMD cd /app/dist && npm run start