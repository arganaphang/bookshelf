package main

import (
	"net/http"

	fiber "github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"

	"github.com/arganaphang/bookshelf/backend/pkg/scalar"
)

// @title Example API
// @version 1.0
// @description This is a server for a example REST API.
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
				PageTitle: "Simple API",
			},
			DarkMode: true,
		})
		if err != nil {
			return ctx.Status(http.StatusInternalServerError).JSON(map[string]any{})
		}

		ctx.Set(fiber.HeaderContentType, fiber.MIMETextHTML)

		return ctx.Status(http.StatusOK).SendString(htmlContent)
	})

	app.Listen("0.0.0.0:8000")
}

type HealthzResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// @Description Health Check
// @ID healthz
// @Produce json
// @Success 200 {object} HealthzResponse "OK"
// @Router /healthz [get]
func getHealthz(ctx *fiber.Ctx) error {
	return ctx.Status(http.StatusOK).JSON(HealthzResponse{
		Success: true,
		Message: "OK",
	})
}
