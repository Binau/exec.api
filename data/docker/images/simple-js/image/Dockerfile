FROM node:10.4-alpine

WORKDIR /app

ADD writeFile.sh .
RUN chmod +x writeFile.sh

ADD build.sh .
RUN chmod +x build.sh

ADD run.sh .
RUN chmod +x run.sh

ADD src ./src