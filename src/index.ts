import Hapi from "@hapi/hapi";
import type { IRepositories } from "./repositories";
import BookRepositoryImpl from "./repositories/impl/book-repository-impl";
import BookRoute from "./routes/book-route";
import HealthRoute from "./routes/health-route";
import type { IServices } from "./services";
import BookServiceImpl from "./services/impl/book-service-impl";
import type { TBook } from "./types/book";

const zodValidator = {
    // biome-ignore lint/suspicious/noExplicitAny: hapi stuff
    compile: (schema: { parse: (arg0: any) => any }) => ({
        // biome-ignore lint/suspicious/noExplicitAny: hapi stuff
        validate: (val: any) => schema.parse(val),
    }),
};

async function main() {
    const server = Hapi.server({
        port: 9000,
        host: "localhost",
    });
    server.validator(zodValidator);

    // Database
    const database: TBook[] = [];

    // Repositories
    const repositories: IRepositories = {
        bookRepository: new BookRepositoryImpl(database),
    };

    // Services
    const services: IServices = {
        bookService: new BookServiceImpl(repositories),
    };

    // Endpoints
    new HealthRoute(server);
    new BookRoute(services, server);

    await server.start();
    console.log("Server running on %s", server.info.uri);
}

process.on("unhandledRejection", (err) => {
    console.log(err);
    process.exit(1);
});

main();
