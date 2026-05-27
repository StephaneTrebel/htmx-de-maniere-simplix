# ── Build stage ───────────────────────────────────────────────────────────────
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Installer templ
RUN go install github.com/a-h/templ/cmd/templ@v0.3.1020

# Copier les sources
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Générer les templates, puis compiler
RUN templ generate ./internal/templates/ && \
    go build -o conduit-hda ./cmd/server

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM alpine:3.21

WORKDIR /app

COPY --from=builder /app/conduit-hda .
COPY --from=builder /app/static ./static

EXPOSE 3000

CMD ["./conduit-hda"]
