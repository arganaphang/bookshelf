import type Hapi from "@hapi/hapi";

export default class HealthRoute {
  #server: Hapi.Server<Hapi.ServerApplicationState>;

  constructor(server: Hapi.Server<Hapi.ServerApplicationState>) {
    this.#server = server;

    this.#server.route({
      method: "GET",
      path: "/healthz",
      handler: (req, h) => this.health(req, h),
    });
  }
  health(
    _req: Hapi.Request<Hapi.ReqRefDefaults>,
    _res: Hapi.ResponseToolkit<Hapi.ReqRefDefaults>
  ) {
    return { message: "OK" };
  }
}
