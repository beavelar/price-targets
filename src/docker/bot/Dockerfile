FROM node:16.13.0

COPY /typescript/services/bot /usr/src/services/bot
COPY /typescript/util/discord /usr/src/util/discord
COPY /typescript/util/env /usr/src/util/env
COPY /typescript/util/logger /usr/src/util/logger
COPY /typescript/package.json /usr/src/package.json
COPY /typescript/tsconfig.json /usr/src/tsconfig.json
RUN set -xe; \
    cd /usr/src; \
    npm install ; \
    npm run build;

WORKDIR /usr/src
CMD ["npm", "run", "startBot"]