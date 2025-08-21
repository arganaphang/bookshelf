package repository

import (
	"context"

	"github.com/arganaphang/bookshelf/backend/internal/dto"
	"github.com/jmoiron/sqlx"
)

type IBookRepository interface {
	GetAll(ctx context.Context, params dto.GetAllBooksRequest) (dto.GetAllBooksResponse, error)
	GetByID(ctx context.Context, params dto.GetBookByIDRequest) (dto.GetBookByIDResponse, error)
	Create(ctx context.Context, params dto.CreateBookRequest) (dto.CreateBookResponse, error)
	UpdateByID(ctx context.Context, params dto.UpdateBookByIDRequest) (dto.UpdateBookByIDResponse, error)
	DeleteByID(ctx context.Context, params dto.DeleteBookByIDRequest) (dto.DeleteBookByIDResponse, error)
}

type bookRepository struct {
	DB *sqlx.DB
}

func NewBook(db *sqlx.DB) IBookRepository {
	return &bookRepository{DB: db}
}

// Create implements IBookRepository.
func (b *bookRepository) Create(ctx context.Context, params dto.CreateBookRequest) (dto.CreateBookResponse, error) {
	panic("unimplemented")
}

// DeleteByID implements IBookRepository.
func (b *bookRepository) DeleteByID(ctx context.Context, params dto.DeleteBookByIDRequest) (dto.DeleteBookByIDResponse, error) {
	panic("unimplemented")
}

// GetAll implements IBookRepository.
func (b *bookRepository) GetAll(ctx context.Context, params dto.GetAllBooksRequest) (dto.GetAllBooksResponse, error) {
	panic("unimplemented")
}

// GetByID implements IBookRepository.
func (b *bookRepository) GetByID(ctx context.Context, params dto.GetBookByIDRequest) (dto.GetBookByIDResponse, error) {
	panic("unimplemented")
}

// UpdateByID implements IBookRepository.
func (b *bookRepository) UpdateByID(ctx context.Context, params dto.UpdateBookByIDRequest) (dto.UpdateBookByIDResponse, error) {
	panic("unimplemented")
}
