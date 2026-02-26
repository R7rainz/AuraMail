# syntax=docker/dockerfile:1
FROM golang:1.24-alpine AS builder
WORKDIR /app

# Copy go mod and sum files first for better caching
COPY go.mod go.sum ./
RUN apk add --no-cache git && go mod download

# Copy the rest of the source code
COPY . .

RUN go build -o backend ./cmd/backend/

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/backend ./backend
COPY ./migrations ./migrations
COPY ./internal/config ./internal/config
COPY .env .env
EXPOSE 8080
CMD ["./backend"]
