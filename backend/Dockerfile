# syntax=docker/dockerfile:1
FROM golang:1.25-alpine AS builder
WORKDIR /app

# Copy go mod and sum files first for better caching
COPY go.mod go.sum ./
RUN apk add --no-cache git && go mod download

# Copy the rest of the source code
COPY . .

RUN go build -o backend ./cmd/backend/
RUN go install github.com/pressly/goose/v3/cmd/goose@v3.27.2

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/backend ./backend
COPY --from=builder /go/bin/goose ./goose
COPY ./migrations ./migrations
COPY ./internal/config ./internal/config
COPY ./entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
EXPOSE 8080
ENTRYPOINT ["./entrypoint.sh"]
