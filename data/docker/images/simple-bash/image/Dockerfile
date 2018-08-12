FROM alpine:3.8

RUN apk add --no-cache sed bash

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