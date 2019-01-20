import { graphqlJaegerMiddleware } from 'graphql-middleware-jaeger';
import { makeExecutableSchema } from 'graphql-tools';
import { applyMiddleware } from 'graphql-middleware';
import { gql, ApolloServer } from 'apollo-server';
import { randomBytes } from 'crypto';
import { Context } from 'apollo-server-core';
import { Request, Response } from 'express';

const isDev = process.env.NODE_ENV === 'development';

const typeDefs = gql`
  type User {
    id: ID
    name: String
  }

  type Query {
    user(id: ID): User
    users: [User]
  }

  input CreateUserInput {
    name: String
  }

  type Mutation {
    createUser(data: CreateUserInput!): User
  }
`;

const users: Array<{ id: string; name: string }> = [];

const resolvers = {
  Query: {
    user(parent: any, args: any) {
      return users.find(u => u.id === args.id);
    },
    users() {
      return users;
    }
  },
  Mutation: {
    createUser(parent: any, args: any) {
      const id = randomBytes(16).toString();
      users.push({ id, name: args.data.name });
      return users.find(u => u.id === id);
    }
  }
};

interface IContext {
  req: Request;
  res: Response;
}

(async () => {
  const tracingMiddleware = graphqlJaegerMiddleware<IContext>(
    { logLevel: 3, samplingRate: 1 },
    { host: 'tracing', serviceName: 'example-service' },
    { rootSpanOptions: { name: 'graphqlRequest' } },
    {
      preResolve: [
        ({ context, rootSpan }) => {
          const { req } = context;
          rootSpan.addAttribute('ip', req.ip);
        }
      ]
    }
  );

  const withTracing = {
    Query: tracingMiddleware,
    Mutation: tracingMiddleware
  };

  const schema = applyMiddleware(
    makeExecutableSchema({ typeDefs, resolvers }),
    withTracing
  );

  const server = new ApolloServer({
    cacheControl: true,
    context: (props: Context) => ({ ...props }),
    cors: true,
    debug: isDev,
    introspection: isDev,
    playground: isDev,
    schema,
    tracing: isDev
  });

  const { url } = await server.listen(4000);
  console.log(`service is up and running at ${url}`);
})();
