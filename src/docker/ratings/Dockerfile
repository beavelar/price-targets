FROM node:16.13.0

# Copy and install ratings service files
COPY /node/services/ratings /usr/src/app/ratings
RUN set -xe; \
    cd /usr/src/app/ratings; \
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

WORKDIR /usr/src/app/ratings
CMD ["npm", "start"]