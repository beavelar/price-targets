FROM node:16.13.0

# Copy and install bot service files
COPY /node/services/bot /usr/src/app/bot
RUN set -xe; \
    cd /usr/src/app/bot; \
    npm install;

# Copy and install discord utility files
COPY /node/util/discord /usr/src/util/discord
RUN set -xe; \
    cd /usr/src/util/discord; \
    npm install;

# Copy and install env utility files
COPY /node/util/env /usr/src/util/env
RUN set -xe; \
    cd /usr/src/util/env; \
    npm install;

# Copy and install logger utility files
COPY /node/util/logger /usr/src/util/logger
RUN set -xe; \
    cd /usr/src/util/logger; \
    npm install;

WORKDIR /usr/src/app/bot
CMD ["npm", "start"]