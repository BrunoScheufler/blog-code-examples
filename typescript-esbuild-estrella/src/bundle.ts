import { buildHttpServer } from "src/server/http";

const { server: httpServer, shutdown: shutdownHttpServer } = buildHttpServer();

function shutdown(reason: string) {
  return async function () {
    console.log(`Shutting down (reason: ${reason})`);

    await shutdownHttpServer();
    console.log("Shut down http server");
  };
}

// Handle graceful shutdown
process.on("SIGINT", shutdown("SIGINT"));
process.on("SIGTERM", shutdown("SIGTERM"));

httpServer.listen(8080, () => console.log(`Server up and running on :8080`));
