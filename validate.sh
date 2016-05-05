#!/bin/bash

#
# This is a bit brutal (and will affect your system if you are running other
# containers than those of the lab)
#
# we only kill running containers
docker kill $(docker ps -q)
docker rm $(docker ps -a -q)

#
# Remove the docker images
#
docker rmi res/auditor
docker rmi res/musician

#
# Build our 2 docker images
#	
docker build --tag res/musician --file ./docker/image-musician/Dockerfile ./docker/image-musician/
docker build --tag res/auditor --file ./docker/image-auditor/Dockerfile ./docker/image-auditor/

#
# Start 4 containers
#
docker run -d --name res_auditor -p 2205:2205 res/auditor
docker run -d --name res_musician_1 res/musician piano
docker run -d --name res_musician_2 res/musician flute
docker run -d --name res_musician_3 res/musician flute

