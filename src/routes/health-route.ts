import type Hapi from "@hapi/hapi";

export default class HealthRoute {
	constructor(server: Hapi.Server<Hapi.ServerApplicationState>) {
		server.route({
			method: "get",
			path: "/health",
			handler: () => this.getHealth(),
		});
	}

	getHealth() {
		return { message: "OK" };
	}
}
