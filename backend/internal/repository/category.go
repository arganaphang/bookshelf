package repository

import (
	"context"

	"github.com/arganaphang/bookshelf/backend/internal/dto"
	"github.com/arganaphang/bookshelf/backend/internal/entity"
	goqu "github.com/doug-martin/goqu/v9"

	"github.com/jmoiron/sqlx"
)

type ICategoryRepository interface {
	GetAll(ctx context.Context) (dto.GetAllCategoriesResponse, error)
	Create(ctx context.Context, params dto.CreateCategoryRequest) (dto.CreateCategoryResponse, error)
}

type categoryRepository struct {
	DB *sqlx.DB
}

func NewCategory(db *sqlx.DB) ICategoryRepository {
	return &categoryRepository{DB: db}
}

// Create implements ICategoryRepository.
func (c *categoryRepository) Create(ctx context.Context, params dto.CreateCategoryRequest) (dto.CreateCategoryResponse, error) {
	sql, _, err := goqu.
		Insert(entity.TABLE_CATEGORIES).
		Cols(
			"name",
		).
		Vals(goqu.Vals{
			params.Name,
		}).
		ToSQL()
	if err != nil {
		return dto.CreateCategoryResponse{Success: false, Message: "failed to create category"}, err
	}

	if _, err = c.DB.Exec(sql); err != nil {
		return dto.CreateCategoryResponse{Success: false, Message: "failed to create category"}, err
	}
	return dto.CreateCategoryResponse{Success: true, Message: "category created"}, nil
}

// GetAll implements ICategoryRepository.
func (c *categoryRepository) GetAll(ctx context.Context) (dto.GetAllCategoriesResponse, error) {
	query := goqu.From(entity.TABLE_CATEGORIES)
	sql, _, err := query.ToSQL()
	if err != nil {
		return dto.GetAllCategoriesResponse{Success: false, Message: "failed to get categories"}, err
	}

	var results []entity.Category
	if err := c.DB.Select(&results, sql); err != nil {
		return dto.GetAllCategoriesResponse{Success: false, Message: "failed to get categories"}, err
	}

	return dto.GetAllCategoriesResponse{Success: true, Message: "get categories", Data: results}, nil
}
