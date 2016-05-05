FROM node:latest

RUN useradd -m nodejs

USER nodejs
RUN mkdir /home/nodejs/app
COPY . /home/nodejs/app

WORKDIR /home/nodejs/app

RUN npm install


ENTRYPOINT ["node", "index.js"]
