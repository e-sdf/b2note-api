FROM node:latest
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "start.sh", "./"]
RUN npm install --production --silent 
COPY dist dist
EXPOSE 3060
CMD ./start.sh