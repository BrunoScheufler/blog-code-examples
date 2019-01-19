import { ApolloServer, gql, makeExecutableSchema } from 'apollo-server';
import tracing from '@opencensus/nodejs';
import { JaegerTraceExporter } from '@opencensus/exporter-jaeger';
import { Context } from 'apollo-server-core';
import { applyMiddleware } from 'graphql-middleware';
import {
  IMiddlewareResolver,
  IMiddleware
} from 'graphql-middleware/dist/types';
import { Request, Response } from 'express';
import { Span } from '@opencensus/core';

const isDev = process.env.NODE_ENV === 'development';
const enableTracing = process.env.ENABLE_TRACING === 'true';

// Create tracer instance and set basic options
const tracer = tracing.start({
  logLevel: enableTracing ? 2 : 0,
  samplingRate: 1
}).tracer;

// Add Jaeger exporter if tracing is enabled
if (enableTracing) {
  tracer.registerSpanEventListener(
    // the 'host' option below refers
    // to the Jaeger service name defined
    // in your compose file
    new JaegerTraceExporter({ host: 'tracing', serviceName: 'order-service' })
  );
}

interface IContext {
  req: Request;
  res: Response;
  rootSpan?: Span;
}

const typeDefs = gql`
  type Order {
    id: String
    created: Float
  }

  type Query {
    orders: [Order]
    order(id: ID!): Order
  }

  input PlaceOrderInput {
    toppings: [String!]!
    description: String!
  }

  type Mutation {
    placeOrder(data: PlaceOrderInput!): Order
  }
`;

const resolvers = {
  Query: {
    orders(parent: any, args: any, context: any) {
      return [];
    },
    order(parent: any, args: any, context: any) {
      return null;
    }
  },
  Mutation: {
    placeOrder(parent: any, args: any, context: any) {
      return null;
    }
  }
};

const tracingMiddleware: IMiddlewareResolver = async (
  resolve,
  parent,
  args,
  context: IContext,
  info
) => {
  // Resolve request directly, if tracing is disabled
  if (!enableTracing) {
    return resolve(parent, args, context, info);
  }

  const { req: request, res: response } = context;

  return new Promise((res, rej) => {
    // Create root span for request
    tracer.startRootSpan({ name: 'graphqlRequest' }, async span => {
      // Add some basic request information
      span.addAttribute('remote_address', request.ip);
      span.addAttribute('field', info.fieldName);

      // Register handler to end span once request is done
      response.on('finish', () => {
        span.addAttribute('status', response.statusCode);
        span.end();
      });

      // Add root span to context
      context.rootSpan = span;

      // Resolve request and return data, or add error details to span and throw
      try {
        const data = await resolve(parent, args, context, info);
        res(data);
      } catch (err) {
        span.addAnnotation(
          `${err.fieldName || ''} resolver threw an error`,
          err
        );
        rej(err);
      }
    });
  });
};

const resolverTracingMiddleware: IMiddlewareResolver = async (
  resolve,
  parent,
  args,
  context: IContext,
  info
) => {
  const { rootSpan } = context;

  // Resolve directly, if tracing is disabled or not started
  if (!enableTracing || !rootSpan) {
    return resolve(parent, args, context, info);
  }

  // Create child span and add resolver-related data
  const resolverSpan = tracer.startChildSpan('resolverExecution');
  resolverSpan.addAttribute('field', info.fieldName);
  resolverSpan.addAttribute('parent', info.parentType.name);
  resolverSpan.start();

  // Resolve request and return, or throw error (handled by tracingMiddleware)
  try {
    const data = await resolve(parent, args, context, info);
    resolverSpan.end();
    return data;
  } catch (err) {
    resolverSpan.addAnnotation('an error was thrown', err);
    resolverSpan.end();

    err.fieldName = info.fieldName;
    throw err;
  }
};

const withTracingMiddleware: IMiddleware = {
  Query: tracingMiddleware,
  Mutation: tracingMiddleware
};

// To allow for the repeated use of the resolver tracing
// middleware, I'd recommend adding the resolver to every
// resolvable field in the schema, otherwise the middleware
// might not be executed in some cases
const withResolverTracingMiddleware: IMiddleware = {
  Query: {
    orders: resolverTracingMiddleware,
    order: resolverTracingMiddleware
  },
  Mutation: {
    placeOrder: resolverTracingMiddleware
  }
};

(async () => {
  // Construct schema and apply tracing middleware
  const schema = applyMiddleware(
    makeExecutableSchema({ typeDefs, resolvers }),
    withTracingMiddleware,
    withResolverTracingMiddleware
  );

  // Create and launch server
  const server = new ApolloServer({
    cacheControl: true,
    context: (props: Context) => ({ ...props }),
    cors: true,
    debug: isDev,
    introspection: isDev,
    schema,
    playground: isDev,
    tracing: isDev
  });

  const { url } = await server.listen(4000);
  console.log(`order service is running at ${url} `);
})();
