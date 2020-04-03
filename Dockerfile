FROM node:latest
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "start.sh", "./"]
RUN npm install --production --silent 
COPY dist dist
# openid-client is customised, copy it
COPY node_modules/openid-client node_modules/openid-client
EXPOSE 3060
CMD ./start.sh