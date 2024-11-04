import type Hapi from "@hapi/hapi";

export function preResponse(server: Hapi.Server<Hapi.ServerApplicationState>) {
  const preResponse = (
    request: Hapi.Request<Hapi.ReqRefDefaults>,
    h: Hapi.ResponseToolkit<Hapi.ReqRefDefaults>
  ) => {
    const response = request.response;
    // @ts-ignore
    if (!response.isBoom) {
      return h.continue;
    }
    return h.response({
      message: response.message,
    });
  };
  server.ext("onPreResponse", preResponse);
}
