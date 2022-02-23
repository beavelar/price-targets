FROM golang:1.16-alpine

# Copy and install refresher dependencies
COPY /go/refresher/go.mod /usr/src/app/refresher/go.mod
COPY /go/refresher/go.sum /usr/src/app/refresher/go.sum
RUN set -xe; \
    cd /usr/src/app/refresher; \
    go mod download;

# Copy and build refresher go file
COPY /go/refresher/refresher.go /usr/src/app/refresher/refresher.go
RUN set -xe; \
    cd /usr/src/app/refresher; \
    go build -o refresher-exec;

WORKDIR /usr/src/app/refresher
CMD [ "./refresher-exec" ]