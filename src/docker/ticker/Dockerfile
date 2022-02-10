FROM golang:1.16-alpine

# Copy and install ticker dependencies
COPY /go/ticker/go.mod /usr/src/app/ticker/go.mod
COPY /go/ticker/go.sum /usr/src/app/ticker/go.sum
RUN set -xe; \
    cd /usr/src/app/ticker; \
    go mod download;

# Copy and build ticker go file
COPY /go/ticker/ticker.go /usr/src/app/ticker/ticker.go
RUN set -xe; \
    cd /usr/src/app/ticker; \
    go build -o ticker-exec;

WORKDIR /usr/src/app/ticker
CMD [ "./ticker-exec" ]