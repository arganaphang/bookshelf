import { z } from "zod";

export type TBook = {
    id: string;
    bookId: string;
    name: string;
    year: number;
    author: string;
    summary: string;
    publisher: string;
    pageCount: number;
    readPage: number;
    finished: boolean;
    reading: boolean;
    insertedAt: Date;
    updatedAt: Date;
};

export type TGetAllBook = Pick<TBook, "id" | "name" | "publisher">;

export const createBookSchema = z
    .object({
        name: z.string({ message: "Gagal menambahkan buku. Mohon isi nama buku" }),
        readPage: z.number().nonnegative(),
        pageCount: z.number(),
        year: z.number(),
        author: z.string(),
        summary: z.string(),
        publisher: z.string(),
        reading: z.boolean().default(false),
        finished: z.boolean().default(false),
    })
    .refine((data) => data.pageCount && data.readPage && data.readPage <= data.pageCount, {
        message: "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
    })
    .transform((data, ctx) => {
        if (data.readPage === data.pageCount) {
            data.finished = true;
        }
        return data;
    });

export type TCreateBook = z.infer<typeof createBookSchema>;

export const updateBookSchema = z
    .object({
        name: z.string({ message: "Gagal memperbarui buku. Mohon isi nama buku" }),
        readPage: z.number().nonnegative(),
        pageCount: z.number(),
        year: z.number(),
        author: z.string(),
        summary: z.string(),
        publisher: z.string(),
        reading: z.boolean().default(false),
        finished: z.boolean().default(false),
    })
    .refine((data) => data.pageCount && data.readPage && data.readPage <= data.pageCount, {
        message: "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
    })
    .transform((data, ctx) => {
        if (data.readPage === data.pageCount) {
            data.finished = true;
        }
        return data;
    });

export type TUpdateBook = z.infer<typeof updateBookSchema>;
