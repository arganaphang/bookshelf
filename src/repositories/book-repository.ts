import type { TBook, TCreateBook, TGetAllBook, TUpdateBook } from "@/types/book";

export interface BookRepository {
    create(data: TCreateBook): TBook;
    getAll(): TGetAllBook[];
    getByID(id: string): TBook | undefined;
    updateByID(id: string, data: TUpdateBook): boolean;
    deleteByID(id: string): boolean;
}
