.PHONY: build run templ dev clean tidy

BINARY := traffic-dashboard
TEMPL   := $(HOME)/go/bin/templ

tidy:
	go mod tidy

templ:
	$(TEMPL) generate ./internal/templates/...

build: templ
	go build -o $(BINARY) ./cmd/

run: build
	./$(BINARY)

dev:
	$(TEMPL) generate --watch ./internal/templates/... &
	go run ./cmd/

vet:
	go vet ./...

clean:
	rm -f $(BINARY)
	find . -name '*_templ.go' -delete
