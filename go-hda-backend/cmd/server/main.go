package main

import (
	"conduit-hda/internal/handlers"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()
	e.HideBanner = true

	// Middlewares globaux
	e.Use(middleware.RequestLogger())
	e.Use(middleware.Recover())

	// ── Fragments HDA servis par ce backend ──────────────────────────────────
	//
	// Toutes les routes sont préfixées /hda/ pour les distinguer des routes
	// de la SPA. Traefik route /hda/* vers ce backend, tout le reste vers la SPA.
	//
	// step-01 : PopularTags sidebar
	e.GET("/hda/tags", handlers.TagsHandler)

	// Port
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	e.Logger.Fatal(e.Start(":" + port))
}
