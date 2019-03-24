FROM node:8
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 7766
CMD [ "bin/github-to-redis.js" ]
