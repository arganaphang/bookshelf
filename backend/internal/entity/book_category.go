package entity

const TABLE_BOOK_CATEGORY = "book_category"

type BookCategory struct {
	CategoryName string `json:"category_name"`
	BookID       string `json:"book_id"`
}
