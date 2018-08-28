import { makeExecutableSchema } from 'apollo-server';
import { importSchema } from 'graphql-import';

import Query from './resolvers/Query';
import Mutation from './resolvers/Mutation';
import AuthPayload from './resolvers/AuthPayload';
import Subscription from './resolvers/Subscription';
import Feed from './resolvers/Feed';

// The GraphQL schema
const typeDefs = importSchema('./src/schema.graphql');

// A map of functions which return data for the schema.
const resolvers = {
  // supresses warning
  // https://github.com/apollographql/apollo-server/issues/1075
  Node: {
    __resolveType(obj, context, info) {
      return null;
    }
  },
  Query,
  Mutation,
  AuthPayload,
  Subscription,
  Feed
};

export default makeExecutableSchema({ typeDefs, resolvers });
