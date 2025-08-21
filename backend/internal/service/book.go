package service

import (
	"context"

	"github.com/arganaphang/bookshelf/backend/internal/dto"
	"github.com/arganaphang/bookshelf/backend/internal/repository"
)

type IBookService interface {
	GetAll(ctx context.Context, params dto.GetAllBooksRequest) (dto.GetAllBooksResponse, error)
	GetByID(ctx context.Context, params dto.GetBookByIDRequest) (dto.GetBookByIDResponse, error)
	Create(ctx context.Context, params dto.CreateBookRequest) (dto.CreateBookResponse, error)
	UpdateByID(ctx context.Context, params dto.UpdateBookByIDRequest) (dto.UpdateBookByIDResponse, error)
	DeleteByID(ctx context.Context, params dto.DeleteBookByIDRequest) (dto.DeleteBookByIDResponse, error)
}

type bookService struct {
	repositories repository.Repositories
}

func NewBook(repositories repository.Repositories) IBookService {
	return &bookService{repositories: repositories}
}

// Create implements IBookService.
func (b *bookService) Create(ctx context.Context, params dto.CreateBookRequest) (dto.CreateBookResponse, error) {
	return b.repositories.Book.Create(ctx, params)
}

// DeleteByID implements IBookService.
func (b *bookService) DeleteByID(
	ctx context.Context,
	params dto.DeleteBookByIDRequest,
) (dto.DeleteBookByIDResponse, error) {
	return b.repositories.Book.DeleteByID(ctx, params)
}

// GetAll implements IBookService.
func (b *bookService) GetAll(ctx context.Context, params dto.GetAllBooksRequest) (dto.GetAllBooksResponse, error) {
	return b.repositories.Book.GetAll(ctx, params)
}

// GetByID implements IBookService.
func (b *bookService) GetByID(ctx context.Context, params dto.GetBookByIDRequest) (dto.GetBookByIDResponse, error) {
	return b.repositories.Book.GetByID(ctx, params)
}

// UpdateByID implements IBookService.
func (b *bookService) UpdateByID(
	ctx context.Context,
	params dto.UpdateBookByIDRequest,
) (dto.UpdateBookByIDResponse, error) {
	return b.repositories.Book.UpdateByID(ctx, params)
}
