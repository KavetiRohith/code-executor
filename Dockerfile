FROM node:16

RUN apt-get update && apt-get install -y \
    g++ \
    openjdk-11-jdk \
    python3 \
    python3-pip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ENV JAVA_HOME /usr/lib/jvm/java-11-openjdk-amd64

EXPOSE 3000

CMD ["node", "server.js"]
