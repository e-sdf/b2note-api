#FROM node:latest
FROM stain/jena:latest
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash && apt-get install -y nodejs
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "start.sh", "./"]
COPY dist dist
RUN npm install --production --silent 
EXPOSE 3060
ENV NODE_ENV production
CMD ./start.sh