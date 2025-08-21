package dto

import "github.com/arganaphang/bookshelf/backend/internal/entity"

type CreateCategoryRequest struct {
	Name string `json:"name"`
}

type CreateCategoryResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type GetAllCategoriesResponse struct {
	Success bool              `json:"success"`
	Message string            `json:"message"`
	Data    []entity.Category `json:"data"`
}
