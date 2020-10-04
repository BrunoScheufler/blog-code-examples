import { ApolloServer, gql } from "apollo-server";

export function buildGraphQLServer() {
  const server = new ApolloServer({
    typeDefs: gql`
      type Query {
        test: String
      }
    `,
    resolvers: {
      Query: {
        test: () => "hello world",
      },
    },
  });
  const shutdown = () => server.stop();

  return { server, shutdown };
}
