package dto

import (
	"github.com/arganaphang/bookshelf/backend/internal/entity"
)

type GetAllBooksRequest struct {
	Title  *string             `json:"title"`
	Writer *string             `json:"writer"`
	Status []entity.BookStatus `json:"status"`
	Year   uint16              `json:"year"`
}

type GetAllBooksResponse struct {
	Success bool          `json:"success"`
	Message string        `json:"message"`
	Data    []entity.Book `json:"data"`
}

type GetBookByIDRequest struct {
	ID string `json:"id"`
}

type GetBookByIDResponse struct {
	Success bool         `json:"success"`
	Message string       `json:"message"`
	Data    *entity.Book `json:"data"`
}

type CreateBookRequest struct {
	Title    string             `json:"title"`
	Synopsis string             `json:"synopsis"`
	Writer   string             `json:"writer"`
	Year     uint16             `json:"year"`
	Status   *entity.BookStatus `json:"status"`
}

type CreateBookResponse struct {
	Success bool         `json:"success"`
	Message string       `json:"message"`
	Data    *entity.Book `json:"data"`
}

type UpdateBookByIDRequest struct {
	ID       string             `json:"id"`
	Title    string             `json:"title"`
	Synopsis string             `json:"synopsis"`
	Writer   string             `json:"writer"`
	Year     uint16             `json:"year"`
	Status   *entity.BookStatus `json:"status"`
}

type UpdateBookByIDResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    any    `json:"data"`
}

type DeleteBookByIDRequest struct {
	ID string `json:"id"`
}

type DeleteBookByIDResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    any    `json:"data"`
}
