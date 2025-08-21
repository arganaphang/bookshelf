package service

type Services struct {
	Book     IBookService
	Category ICategoryService
	Writer   IWriterService
}
