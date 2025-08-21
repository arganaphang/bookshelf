package dto

import "github.com/arganaphang/bookshelf/backend/internal/entity"

type CreateWriterRequest struct {
	Name string `json:"name"`
}

type CreateWriterResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type GetAllWritersResponse struct {
	Success bool            `json:"success"`
	Message string          `json:"message"`
	Data    []entity.Writer `json:"data"`
}
