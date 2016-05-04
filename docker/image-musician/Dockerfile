FROM fedora:latest

RUN dnf install npm -y && dnf clean all

RUN useradd -m nodejs

USER nodejs
RUN mkdir /home/nodejs/app
COPY . /home/nodejs/app

WORKDIR /home/nodejs/app

RUN npm install


ENTRYPOINT ["node", "index.js"]
