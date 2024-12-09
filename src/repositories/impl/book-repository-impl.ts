import type { BookRepository } from "@/repositories/book-repository";
import type { TBook, TCreateBook, TGetAllBook, TGetAllBookParams, TUpdateBook } from "@/types/book";
import { nanoid } from "nanoid";

export default class BookRepositoryImpl implements BookRepository {
    #database: TBook[];

    constructor(database: TBook[]) {
        this.#database = database;
    }

    create(data: TCreateBook): TBook {
        const id = nanoid();
        const now = new Date();
        const newBook: TBook = {
            ...data,
            id: id,
            bookId: id,
            insertedAt: now,
            updatedAt: now,
        };
        this.#database.push(newBook);
        return newBook;
    }

    getAll(params: TGetAllBookParams): TGetAllBook[] {
        let books: TBook[] = [...this.#database];

        if (params.reading !== undefined) {
            books = books.filter((book) => book.reading === params.reading);
        }

        if (params.finished !== undefined) {
            books = books.filter((book) => book.finished === params.finished);
        }

        if (params.name !== undefined) {
            books = books.filter((book) => book.name.toLowerCase().includes(params.name?.toLowerCase() ?? ""));
        }

        return books.map((book) => ({ id: book.id, name: book.name, publisher: book.publisher }));
    }

    getByID(id: string): TBook | undefined {
        return this.#database.find((book) => book.id === id);
    }

    updateByID(id: string, data: TUpdateBook): boolean {
        if (!this.#database.some((book) => book.id === id)) {
            return false;
        }
        const now = new Date();
        this.#database = this.#database.map((book) => {
            if (book.id === id) {
                return {
                    ...book,
                    ...data,
                    updatedAt: now,
                };
            }
            return book;
        });
        return true;
    }

    deleteByID(id: string): boolean {
        if (!this.#database.some((book) => book.id === id)) {
            return false;
        }
        this.#database = this.#database.filter((book) => book.id !== id);
        return true;
    }
}
