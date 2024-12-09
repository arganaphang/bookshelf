import type { IServices } from "@/services";
import {
    type TCreateBook,
    type TGetAllBookParams,
    type TUpdateBook,
    createBookSchema,
    updateBookSchema,
} from "@/types/book";
import type Hapi from "@hapi/hapi";
import { type ZodIssue, z } from "zod";

export default class BookRoute {
    services: IServices;

    constructor(services: IServices, server: Hapi.Server<Hapi.ServerApplicationState>) {
        this.services = services;

        // Endpoints
        server.route({
            method: "post",
            path: "/books",
            handler: async (req, res) => {
                const body = req.payload as TCreateBook;
                const result = await this.create(body);
                return res
                    .response({ status: "success", message: "Buku berhasil ditambahkan", data: result })
                    .code(201);
            },
            options: {
                validate: {
                    payload: createBookSchema,
                    failAction: (req, res, error) => {
                        const err = JSON.parse(error?.message || "") as ZodIssue[];
                        return res
                            .response({
                                status: "fail",
                                message: err?.[0]?.message,
                            })
                            .code(400)
                            .takeover();
                    },
                },
            },
        });
        // TODO: add query params
        /**
         * reading: 0 | 1
         * finished: 0 | 1
         * name: contains
         */
        server.route({
            method: "get",
            path: "/books",
            handler: async (req, res) => {
                let { reading, finished, name } = req.query;
                if (reading !== undefined) {
                    if (reading === "1") reading = true;
                    if (reading === "0") reading = false;
                }
                if (finished !== undefined) {
                    if (finished === "1") finished = true;
                    if (finished === "0") finished = false;
                }
                const result = await this.getAll({ reading, finished, name });
                return res
                    .response({ status: "success", message: "Buku berhasil ditemukan", data: { books: result } })
                    .code(200);
            },
        });
        server.route({
            method: "get",
            path: "/books/{id}",
            handler: async (req, res) => {
                const id = req.params.id;
                const result = await this.getByID(id);
                if (!result) {
                    return res
                        .response({ status: "fail", message: "Buku tidak ditemukan", data: { book: result } })
                        .code(404);
                }
                return res
                    .response({ status: "success", message: "Buku berhasil ditemukan", data: { book: result } })
                    .code(200);
            },
        });
        server.route({
            method: "put",
            path: "/books/{id}",
            handler: async (req, res) => {
                const id = req.params.id;
                const body = req.payload as TUpdateBook;
                const result = await this.updateByID(id, body);
                if (!result) {
                    return res
                        .response({
                            status: "fail",
                            message: "Gagal memperbarui buku. Id tidak ditemukan",
                            data: result,
                        })
                        .code(404);
                }
                return res.response({ status: "success", message: "Buku berhasil diperbarui", data: result }).code(200);
            },
            options: {
                validate: {
                    payload: updateBookSchema,
                    failAction: (req, res, error) => {
                        const err = JSON.parse(error?.message || "") as ZodIssue[];
                        return res
                            .response({
                                status: "fail",
                                message: err?.[0]?.message,
                            })
                            .code(400)
                            .takeover();
                    },
                },
            },
        });
        server.route({
            method: "delete",
            path: "/books/{id}",
            handler: async (req, res) => {
                const id = req.params.id;
                const result = await this.deleteByID(id);
                if (!result) {
                    return res
                        .response({ status: "fail", message: "Buku gagal dihapus. Id tidak ditemukan", data: result })
                        .code(404);
                }
                return res.response({ status: "success", message: "Buku berhasil dihapus" }).code(200);
            },
        });
    }

    create(data: TCreateBook) {
        return this.services.bookService.create(data);
    }

    getAll(params: TGetAllBookParams) {
        return this.services.bookService.getAll(params);
    }

    getByID(id: string) {
        return this.services.bookService.getByID(id);
    }

    updateByID(id: string, data: TUpdateBook) {
        return this.services.bookService.updateByID(id, data);
    }

    deleteByID(id: string) {
        return this.services.bookService.deleteByID(id);
    }
}
