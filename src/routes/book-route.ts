import type { IServices } from "@/services";
import type Hapi from "@hapi/hapi";

export default class BookRoute {
  #server: Hapi.Server<Hapi.ServerApplicationState>;
  #services: IServices;

  constructor(
    server: Hapi.Server<Hapi.ServerApplicationState>,
    services: IServices
  ) {
    this.#server = server;
    this.#services = services;
  }
}
