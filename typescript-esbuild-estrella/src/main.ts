import { buildServer } from "src/server/http";

const { server, shutdown: shutdownServer } = buildServer();

function shutdown(reason: string) {
  return async function () {
    console.log(`Shutting down (reason: ${reason})`);
    await shutdownServer();
    console.log("Shut down server");
  };
}

// Handle graceful shutdown
process.on("SIGINT", shutdown("SIGINT"));
process.on("SIGTERM", shutdown("SIGTERM"));

server.listen(8080, () => console.log(`Server up and running on :8080`));
