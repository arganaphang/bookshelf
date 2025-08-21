package route

import (
	"net/http"

	fiber "github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"

	"github.com/arganaphang/bookshelf/backend/internal/dto"
	"github.com/arganaphang/bookshelf/backend/internal/service"
)

type IWriterRoute interface {
	GetAll(ctx *fiber.Ctx) error
	Create(ctx *fiber.Ctx) error
}

type writerRoute struct {
	services service.Services
}

func NewWriter(app *fiber.App, services service.Services) IWriterRoute {
	handler := &writerRoute{services: services}
	route := app.Group("/api/v1/writers")
	route.Get("/", handler.GetAll)
	route.Post("/", handler.Create)
	return handler
}

// Create implements IWriterRoute.
// @Summary Create
// @Description Create Writer
// @ID writer-create
// @Tags Writers
// Accept json
// @Produce json
// @Param request body dto.CreateWriterRequest true "request body create writer"
// @Success 200 {object} dto.CreateWriterResponse "OK"
// @Router /api/v1/writers [post]
func (c *writerRoute) Create(ctx *fiber.Ctx) error {
	var params dto.CreateWriterRequest
	if err := ctx.BodyParser(&params); err != nil {
		logrus.Error("Error parsing body: ", err.Error())
		return ctx.Status(http.StatusBadRequest).JSON(dto.CreateWriterResponse{
			Success: false,
			Message: "failed to parse request body",
		})
	}

	result, err := c.services.Writer.Create(ctx.Context(), params)
	if err != nil {
		logrus.Error("Error creating writer: ", err.Error())
		return ctx.Status(http.StatusBadRequest).JSON(result)
	}

	return ctx.Status(http.StatusCreated).JSON(result)
}

// GetAll implements IWriterRoute.
// @Summary Get All
// @Description Get All Writer
// @ID writer-get-all
// @Tags Writers
// Accept json
// @Produce json
// @Success 200 {object} dto.GetAllWritersResponse "OK"
// @Router /api/v1/writers [get]
func (c *writerRoute) GetAll(ctx *fiber.Ctx) error {
	results, err := c.services.Writer.GetAll(ctx.Context())
	if err != nil {
		logrus.Info("Error get writers: ", err.Error())
		return ctx.Status(http.StatusBadRequest).JSON(results)
	}

	return ctx.Status(http.StatusOK).JSON(results)
}
