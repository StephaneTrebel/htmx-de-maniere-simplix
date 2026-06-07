package main

import (
	"log"

	"traffic-dashboard/internal/config"
	"traffic-dashboard/internal/server"
)

func main() {
	cfg := config.Default()
	s := server.New(cfg)
	log.Printf("traffic-dashboard collector listening on %s", cfg.ListenAddr)
	if err := s.Start(); err != nil {
		log.Fatalf("collector error: %v", err)
	}
}
