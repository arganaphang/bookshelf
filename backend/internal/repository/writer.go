package repository

import (
	"context"

	"github.com/arganaphang/bookshelf/backend/internal/dto"
	"github.com/arganaphang/bookshelf/backend/internal/entity"
	goqu "github.com/doug-martin/goqu/v9"
	"github.com/jmoiron/sqlx"
)

type IWriterRepository interface {
	GetAll(ctx context.Context) (dto.GetAllWritersResponse, error)
	Create(ctx context.Context, params dto.CreateWriterRequest) (dto.CreateWriterResponse, error)
}

type writerRepository struct {
	DB *sqlx.DB
}

func NewWriter(db *sqlx.DB) IWriterRepository {
	return &writerRepository{DB: db}
}

// Create implements IWriterRepository.
func (c *writerRepository) Create(ctx context.Context, params dto.CreateWriterRequest) (dto.CreateWriterResponse, error) {
	sql, _, err := goqu.
		Insert(entity.TABLE_WRITERS).
		Cols(
			"name",
		).
		Vals(goqu.Vals{
			params.Name,
		}).
		ToSQL()
	if err != nil {
		return dto.CreateWriterResponse{Success: false, Message: "failed to create writer"}, err
	}

	if _, err = c.DB.Exec(sql); err != nil {
		return dto.CreateWriterResponse{Success: false, Message: "failed to create writer"}, err
	}
	return dto.CreateWriterResponse{Success: true, Message: "writer created"}, nil
}

// GetAll implements IWriterRepository.
func (c *writerRepository) GetAll(ctx context.Context) (dto.GetAllWritersResponse, error) {
	query := goqu.From(entity.TABLE_WRITERS)
	sql, _, err := query.ToSQL()
	if err != nil {
		return dto.GetAllWritersResponse{Success: false, Message: "failed to get writer"}, err
	}

	var results []entity.Writer
	if err := c.DB.Select(&results, sql); err != nil {
		return dto.GetAllWritersResponse{Success: false, Message: "failed to get writer"}, err
	}

	return dto.GetAllWritersResponse{Success: true, Message: "get writers", Data: results}, nil
}
