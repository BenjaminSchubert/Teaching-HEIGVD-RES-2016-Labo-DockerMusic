FROM node:latest

RUN useradd -m nodejs

RUN mkdir /home/nodejs/app
COPY . /home/nodejs/app

RUN chown -R nodejs: /home/nodejs

USER nodejs

WORKDIR /home/nodejs/app

RUN npm install


ENTRYPOINT ["node", "index.js"]
