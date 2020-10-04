import { buildGraphQLServer } from "./server/graphql";

const { server, shutdown: shutdownServer } = buildGraphQLServer();

function shutdown(reason: string) {
  return async function () {
    console.log(`Shutting down (reason: ${reason})`);

    await shutdownServer();
    console.log("Shut down GraphQL server");
  };
}

// Handle graceful shutdown
process.on("SIGINT", shutdown("SIGINT"));
process.on("SIGTERM", shutdown("SIGTERM"));

async function main() {
  const info = await server.listen(4000);
  console.log(`GraphQL server listening at ${info.url}`);
}

main();
