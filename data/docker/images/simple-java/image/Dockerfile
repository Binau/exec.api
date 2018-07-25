FROM java:8-jdk-alpine

RUN apk add --no-cache sed

WORKDIR /app

ADD writeFile.sh .
RUN chmod +x writeFile.sh

ADD runWrapper.sh .
RUN chmod +x runWrapper.sh
ADD run.sh .
RUN chmod +x run.sh

ADD buildWrapper.sh .
RUN chmod +x buildWrapper.sh
ADD build.sh .
RUN chmod +x build.sh

ADD src ./src

CMD ["sh"]