FROM golang:1.16-alpine

# Copy and install realtime dependencies
COPY /go/realtime/go.mod /usr/src/app/realtime/go.mod
RUN set -xe; \
    cd /usr/src/app/realtime; \
    go mod download;

# Copy and build realtime go file
COPY /go/realtime/realtime.go /usr/src/app/realtime/realtime.go
RUN set -xe; \
    cd /usr/src/app/realtime; \
    go build -o realtime-exec;

WORKDIR /usr/src/app/realtime
CMD [ "./realtime-exec" ]