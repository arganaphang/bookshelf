package route

import (
	"net/http"

	fiber "github.com/gofiber/fiber/v2"
	"github.com/oklog/ulid/v2"
	"github.com/sirupsen/logrus"

	"github.com/arganaphang/bookshelf/backend/internal/dto"
	"github.com/arganaphang/bookshelf/backend/internal/service"
)

type IBookRoute interface {
	GetAll(ctx *fiber.Ctx) error
	GetByID(ctx *fiber.Ctx) error
	Create(ctx *fiber.Ctx) error
	UpdateByID(ctx *fiber.Ctx) error
	DeleteByID(ctx *fiber.Ctx) error
}

type bookRoute struct {
	services service.Services
}

func NewBook(app *fiber.App, services service.Services) IBookRoute {
	handler := &bookRoute{services: services}
	route := app.Group("/api/v1/books")
	route.Get("/", handler.GetAll)
	route.Get("/:id", handler.GetByID)
	route.Post("/", handler.Create)
	route.Put("/:id", handler.UpdateByID)
	route.Delete("/:id", handler.DeleteByID)
	return handler
}

// Create implements IBookRoute.
// @Summary Create
// @Description Create Book
// @ID book-create
// @Tags Books
// Accept json
// @Produce json
// @Success 200 {object} dto.CreateBookResponse "OK"
// @Router /api/v1/books [post]
func (c *bookRoute) Create(ctx *fiber.Ctx) error {
	var params dto.CreateBookRequest
	if err := ctx.BodyParser(&params); err != nil {
		logrus.Error("Error parsing body: ", err.Error())
		return ctx.Status(http.StatusBadRequest).JSON(dto.CreateBookResponse{
			Success: false,
			Message: "failed to parse request body",
		})
	}
	result, err := c.services.Book.Create(ctx.Context(), params)
	if err != nil {
		logrus.Error("Error creating book: ", err.Error())
		return ctx.Status(http.StatusBadRequest).JSON(result)
	}

	return ctx.Status(http.StatusCreated).JSON(result)
}

// GetAll implements IBookRoute.
// @Summary Get All
// @Description Get All Books
// @ID book-get-all
// @Tags Books
// @Accept json
// @Produce json
// @Success 200 {object} dto.GetAllBooksResponse "OK"
// @Router /api/v1/books [get]
func (c *bookRoute) GetAll(ctx *fiber.Ctx) error {
	var params dto.GetAllBooksRequest
	if err := ctx.QueryParser(&params); err != nil {
		logrus.Error("Error parsing query: ", err.Error())
		return ctx.Status(http.StatusBadRequest).JSON(dto.GetAllBooksResponse{
			Success: false,
			Message: "failed to parse request query",
		})
	}
	result, err := c.services.Book.GetAll(ctx.Context(), params)
	if err != nil {
		logrus.Error("Error get all books: ", err.Error())
		return ctx.Status(http.StatusBadRequest).JSON(result)
	}

	return ctx.Status(http.StatusOK).JSON(result)
}

// GetByID implements IBookRoute.
// @Summary Get By ID
// @Description Get Book by ID
// @ID book-get
// @Tags Books
// @Accept json
// @Produce json
// @Param id path int true "Book Id"
// @Success 200 {object} dto.GetBookByIDResponse "OK"
// @Router /api/v1/books/{id} [get]
func (c *bookRoute) GetByID(ctx *fiber.Ctx) error {
	id, err := ulid.Parse(ctx.Params("id"))
	if err != nil {
		logrus.Error("Error parsing id: ", err.Error())
		return ctx.Status(http.StatusBadRequest).JSON(dto.GetBookByIDResponse{
			Success: false,
			Message: "failed to parse id",
		})
	}
	result, err := c.services.Book.GetByID(ctx.Context(), dto.GetBookByIDRequest{ID: id.String()})
	if err != nil {
		logrus.Error("Error get book by id: ", err.Error())
		return ctx.Status(http.StatusBadRequest).JSON(result)
	}

	return ctx.Status(http.StatusOK).JSON(result)
}

// UpdateByID implements IBookRoute.
// @Summary Update
// @Description Update Book by ID
// @ID book-update
// @Tags Books
// @Accept json
// @Produce json
// @Param id path int true "Book Id"
// @Success 200 {object} dto.UpdateBookByIDResponse "OK"
// @Router /api/v1/books/{id} [put]
func (c *bookRoute) UpdateByID(ctx *fiber.Ctx) error {
	id, err := ulid.Parse(ctx.Params("id"))
	if err != nil {
		logrus.Error("Error parsing id: ", err.Error())
		return ctx.Status(http.StatusBadRequest).JSON(dto.UpdateBookByIDResponse{
			Success: false,
			Message: "failed to parse id",
		})
	}
	var params dto.UpdateBookByIDRequest
	if err := ctx.BodyParser(&params); err != nil {
		logrus.Error("Error parsing body: ", err.Error())
		return ctx.Status(http.StatusBadRequest).JSON(dto.UpdateBookByIDResponse{
			Success: false,
			Message: "failed to parse request body",
		})
	}
	params.ID = id.String() // Override ID
	result, err := c.services.Book.UpdateByID(ctx.Context(), params)
	if err != nil {
		logrus.Error("Error update book by id: ", err.Error())
		return ctx.Status(http.StatusBadRequest).JSON(result)
	}

	return ctx.Status(http.StatusOK).JSON(result)
}

// DeleteByID implements IBookRoute.
// @Summary Delete
// @Description Delete Book by ID
// @ID book-delete
// @Tags Books
// @Accept json
// @Produce json
// @Param id path int true "Book Id"
// @Success 200 {object} dto.DeleteBookByIDResponse "OK"
// @Router /api/v1/books/{id} [delete]
func (c *bookRoute) DeleteByID(ctx *fiber.Ctx) error {
	id, err := ulid.Parse(ctx.Params("id"))
	if err != nil {
		logrus.Error("Error parsing id: ", err.Error())
		return ctx.Status(http.StatusBadRequest).JSON(dto.DeleteBookByIDResponse{
			Success: false,
			Message: "failed to parse id",
		})
	}
	result, err := c.services.Book.DeleteByID(ctx.Context(), dto.DeleteBookByIDRequest{ID: id.String()})
	if err != nil {
		logrus.Error("Error delete book by id: ", err.Error())
		return ctx.Status(http.StatusBadRequest).JSON(result)
	}

	return ctx.Status(http.StatusOK).JSON(result)
}
