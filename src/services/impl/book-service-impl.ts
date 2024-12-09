import type { IRepositories } from "@/repositories";
import type { BookService } from "@/services/book-service";
import type { TCreateBook, TGetAllBookParams, TUpdateBook } from "@/types/book";

export default class BookServiceImpl implements BookService {
    repositories: IRepositories;

    constructor(repositories: IRepositories) {
        this.repositories = repositories;
    }

    create(data: TCreateBook) {
        return this.repositories.bookRepository.create(data);
    }

    getByID(id: string) {
        return this.repositories.bookRepository.getByID(id);
    }

    getAll(params: TGetAllBookParams) {
        return this.repositories.bookRepository.getAll(params);
    }

    updateByID(id: string, data: TUpdateBook) {
        return this.repositories.bookRepository.updateByID(id, data);
    }

    deleteByID(id: string) {
        return this.repositories.bookRepository.deleteByID(id);
    }
}
