FROM node:latest
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "run.sh", "./"]
# RUN npm install --production --silent
COPY . .
EXPOSE 3060
CMD ./run.sh