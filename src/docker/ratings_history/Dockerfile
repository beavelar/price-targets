FROM golang:1.16-alpine

# Copy and install ratings_history dependencies
COPY /go/ratings_history/go.mod /usr/src/app/ratings_history/go.mod
COPY /go/ratings_history/go.sum /usr/src/app/ratings_history/go.sum
RUN set -xe; \
    cd /usr/src/app/ratings_history; \
    go mod download;

# Copy and build ratings_history go file
COPY /go/ratings_history/ratings_history.go /usr/src/app/ratings_history/ratings_history.go
RUN set -xe; \
    cd /usr/src/app/ratings_history; \
    go build -o ratings_history-exec;

WORKDIR /usr/src/app/ratings_history
CMD [ "./ratings_history-exec" ]