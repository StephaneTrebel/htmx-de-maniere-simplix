.PHONY: build run templ dev clean

BINARY := conduit-hda
TEMPL   := $(HOME)/go/bin/templ

templ:
	$(TEMPL) generate ./internal/templates/...

build: templ
	go build -o $(BINARY) ./cmd/server

run: build
	./$(BINARY)

dev:
	$(TEMPL) generate --watch ./internal/templates/... &
	go run ./cmd/server

vet:
	go vet ./...

clean:
	rm -f $(BINARY)
	find . -name '*_templ.go' -delete
