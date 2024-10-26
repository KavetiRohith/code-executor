FROM node:16

RUN apt-get update && apt-get install -y \
    g++ \
    openjdk-11-jdk \
    python3 \
    python3-pip \
    cxxtest \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install && pip3 install pytest

RUN mkdir lib

RUN curl -L -o lib/junit-4.13.2.jar https://repo1.maven.org/maven2/junit/junit/4.13.2/junit-4.13.2.jar && \
    curl -L -o lib/hamcrest-core-1.3.jar https://repo1.maven.org/maven2/org/hamcrest/hamcrest-core/1.3/hamcrest-core-1.3.jar

COPY . .

ENV JAVA_HOME /usr/lib/jvm/java-11-openjdk-amd64
ENV PATH $JAVA_HOME/bin:$PATH

EXPOSE 3000

CMD ["node", "server.js"]
