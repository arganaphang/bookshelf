package entity

import (
	"time"
)

const TABLE_BOOKS = "books"

type BookStatus string

const (
	BookStatusNotStarted BookStatus = "NOT_STARTED"
	BookStatusWishlist   BookStatus = "WISHLIST"
	BookStatusReading    BookStatus = "READING"
	BookStatusFinished   BookStatus = "FINISHED"
)

type Book struct {
	ID        string     `json:"id"`
	Title     string     `json:"title"`
	Synopsis  string     `json:"synopsis"`
	Writer    string     `json:"writer"`
	Year      uint16     `json:"year"`
	CoverURL  *string    `json:"cover_url"`
	Status    BookStatus `json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}
