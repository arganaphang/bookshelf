import type { TBook, TCreateBook, TGetAllBook, TGetAllBookParams, TUpdateBook } from "@/types/book";

export interface BookRepository {
    create(data: TCreateBook): TBook;
    getAll(params: TGetAllBookParams): TGetAllBook[];
    getByID(id: string): TBook | undefined;
    updateByID(id: string, data: TUpdateBook): boolean;
    deleteByID(id: string): boolean;
}
