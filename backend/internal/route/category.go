package route

import (
	"net/http"

	fiber "github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"

	"github.com/arganaphang/bookshelf/backend/internal/dto"
	"github.com/arganaphang/bookshelf/backend/internal/service"
)

type ICategoryRoute interface {
	GetAll(ctx *fiber.Ctx) error
	Create(ctx *fiber.Ctx) error
}

type categoryRoute struct {
	services service.Services
}

func NewCategory(app *fiber.App, services service.Services) ICategoryRoute {
	handler := &categoryRoute{services: services}
	route := app.Group("/api/v1/categories")
	route.Get("/", handler.GetAll)
	route.Post("/", handler.Create)
	return handler
}

// Create implements ICategoryHandler.
// @Summary Create
// @Description Create Category
// @ID category-create
// @Tags Categories
// Accept json
// @Produce json
// @Param request body dto.CreateCategoryRequest true "request body create category"
// @Success 200 {object} dto.CreateCategoryResponse "OK"
// @Router /api/v1/categories [post]
func (c *categoryRoute) Create(ctx *fiber.Ctx) error {
	var params dto.CreateCategoryRequest
	if err := ctx.BodyParser(&params); err != nil {
		logrus.Error("Error parsing body: ", err.Error())
		return ctx.Status(http.StatusBadRequest).JSON(dto.CreateCategoryResponse{
			Success: false,
			Message: "failed to parse request body",
		})
	}

	result, err := c.services.Category.Create(ctx.Context(), params)
	if err != nil {
		logrus.Error("Error creating category: ", err.Error())
		return ctx.Status(http.StatusBadRequest).JSON(result)
	}

	return ctx.Status(http.StatusCreated).JSON(result)
}

// GetAll implements ICategoryHandler.
// @Summary Get All
// @Description Get All Category
// @ID category-get-all
// @Tags Categories
// Accept json
// @Produce json
// @Success 200 {object} dto.GetAllCategoriesResponse "OK"
// @Router /api/v1/categories [get]
func (c *categoryRoute) GetAll(ctx *fiber.Ctx) error {
	results, err := c.services.Category.GetAll(ctx.Context())
	if err != nil {
		logrus.Info("Error get categories: ", err.Error())
		return ctx.Status(http.StatusBadRequest).JSON(results)
	}

	return ctx.Status(http.StatusOK).JSON(results)
}
