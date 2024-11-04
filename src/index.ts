import type { IRepositories } from "@/repositories";
import BookRepository from "@/repositories/book-repository";
import HealthRoute from "@/routes/healthz-route";
import type { IServices } from "@/services";
import BookService from "@/services/book-service";
import { preResponse } from "@/utils/pre-response";
import Hapi from "@hapi/hapi";
import BookRoute from "./routes/book-route";

async function main() {
  const server = Hapi.server({ port: 9000 });

  // Pre-Response
  preResponse(server);

  // Repositories
  const repositories: IRepositories = {
    bookRepository: new BookRepository(),
  };

  // Services
  const services: IServices = {
    bookService: new BookService(repositories),
  };

  // Routes
  new HealthRoute(server);
  new BookRoute(server, services);

  await server.start();
  console.log("🔥 Server running on %s", server.info.uri);
}

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

main();
