package service

import (
	"context"

	"github.com/arganaphang/bookshelf/backend/internal/dto"
	"github.com/arganaphang/bookshelf/backend/internal/repository"
)

type IWriterService interface {
	GetAll(ctx context.Context) (dto.GetAllWritersResponse, error)
	Create(ctx context.Context, params dto.CreateWriterRequest) (dto.CreateWriterResponse, error)
}

type writerService struct {
	repositories repository.Repositories
}

func NewWriter(repositories repository.Repositories) IWriterService {
	return &writerService{repositories: repositories}
}

// Create implements IWriterService.
func (w *writerService) Create(ctx context.Context, params dto.CreateWriterRequest) (dto.CreateWriterResponse, error) {
	return w.repositories.Writer.Create(ctx, params)
}

// GetAll implements IWriterService.
func (w *writerService) GetAll(ctx context.Context) (dto.GetAllWritersResponse, error) {
	return w.repositories.Writer.GetAll(ctx)
}
