package main

import (
	"log"
	"net/http"
	"os"

	fiber "github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"

	"github.com/arganaphang/bookshelf/backend/internal/repository"
	"github.com/arganaphang/bookshelf/backend/internal/route"
	"github.com/arganaphang/bookshelf/backend/internal/service"
	"github.com/arganaphang/bookshelf/backend/pkg/scalar"
)

// @title Bookshelf API
// @version 1.0
// @description This is a server for a Bookshelf REST API.
// @contact.name Argana Phangquestian
// @contact.email arganaphangquestian@gmail.com
// @license.name MIT License
// @license.url https://mit-license.org/
// @host 0.0.0.0:8000
// @BasePath /
func main() {
	app := fiber.New()
	app.Use(cors.New())

	app.Get("/healthz", getHealthz)
	app.Get("/docs", func(ctx *fiber.Ctx) error {
		htmlContent, err := scalar.ApiReferenceHTML(&scalar.Options{
			SpecURL: "./docs/swagger.json",
			CustomOptions: scalar.CustomOptions{
				PageTitle: "Bookshelf API",
			},
			DarkMode: true,
		})
		if err != nil {
			return ctx.Status(http.StatusInternalServerError).JSON(map[string]any{})
		}

		ctx.Set(fiber.HeaderContentType, fiber.MIMETextHTML)

		return ctx.Status(http.StatusOK).SendString(htmlContent)
	})

	db, err := sqlx.Open(
		"postgres",
		os.Getenv("DATABASE_URL"),
	)
	if err != nil {
		log.Fatalln("failed to open database connection", err.Error())
	}
	if err := db.Ping(); err != nil {
		log.Fatalln("failed to ping database", err.Error())
	}

	repositories := repository.Repositories{
		Book:     repository.NewBook(db),
		Category: repository.NewCategory(db),
		Writer:   repository.NewWriter(db),
	}

	services := service.Services{
		Book:     service.NewBook(repositories),
		Category: service.NewCategory(repositories),
		Writer:   service.NewWriter(repositories),
	}

	_ = route.Routes{
		Book:     route.NewBook(app, services),
		Category: route.NewCategory(app, services),
		Writer:   route.NewWriter(app, services),
	}

	app.Listen("0.0.0.0:8000")
}

type HealthzResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// @Summary Health
// @Description Health Check
// @ID healthz
// @Tags Health
// @Produce json
// @Success 200 {object} HealthzResponse "OK"
// @Router /healthz [get]
func getHealthz(ctx *fiber.Ctx) error {
	return ctx.Status(http.StatusOK).JSON(HealthzResponse{
		Success: true,
		Message: "OK",
	})
}
