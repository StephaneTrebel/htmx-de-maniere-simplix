# ── Build stage ───────────────────────────────────────────────────────────────
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Install templ
RUN go install github.com/a-h/templ/cmd/templ@v0.3.1020

# Copy all sources first (go mod tidy needs the source tree)
COPY . .

# Resolve dependencies and generate templ files, then compile
RUN go mod tidy && \
    templ generate ./internal/templates/... && \
    go build -o traffic-dashboard ./cmd/

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM alpine:3.21

WORKDIR /app

COPY --from=builder /app/traffic-dashboard .

EXPOSE 8765

CMD ["./traffic-dashboard"]
