import { createServer } from "http";

export function buildHttpServer() {
  const server = createServer((_, response) => {
    response.writeHead(200);
    response.end(JSON.stringify({ hello: "world" }));
  });

  const shutdown = () =>
    new Promise((res, rej) => server.close((err) => (err ? rej(err) : res())));

  return { server, shutdown };
}
