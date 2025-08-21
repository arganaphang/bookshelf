package repository

type Repositories struct {
	Book     IBookRepository
	Category ICategoryRepository
	Writer   IWriterRepository
}
