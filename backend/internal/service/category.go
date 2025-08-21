package service

import (
	"context"

	"github.com/arganaphang/bookshelf/backend/internal/dto"
	"github.com/arganaphang/bookshelf/backend/internal/repository"
)

type ICategoryService interface {
	GetAll(ctx context.Context) (dto.GetAllCategoriesResponse, error)
	Create(ctx context.Context, params dto.CreateCategoryRequest) (dto.CreateCategoryResponse, error)
}

type categoryService struct {
	repositories repository.Repositories
}

func NewCategory(repositories repository.Repositories) ICategoryService {
	return &categoryService{repositories: repositories}
}

// Create implements ICategoryService.
func (c *categoryService) Create(ctx context.Context, params dto.CreateCategoryRequest) (dto.CreateCategoryResponse, error) {
	return c.repositories.Category.Create(ctx, params)
}

// GetAll implements ICategoryService.
func (c *categoryService) GetAll(ctx context.Context) (dto.GetAllCategoriesResponse, error) {
	return c.repositories.Category.GetAll(ctx)
}
