# Development stage
FROM golang:1.25-alpine AS development
RUN apk add --no-cache git
RUN go install github.com/air-verse/air@latest
RUN go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o ./tmp/main ./cmd/server
EXPOSE 8080
CMD ["air"]

# Production stage (for future use)
FROM golang:1.25-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /server ./cmd/server

FROM alpine:3.20 AS production
RUN apk add --no-cache ca-certificates
COPY --from=build /server /server
EXPOSE 8080
CMD ["/server"]
