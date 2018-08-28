import { ApolloServer } from 'apollo-server';
import { Prisma } from 'prisma-binding';

import schema from './schema';

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({
  schema,
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: 'https://eu1.prisma.sh/arnaud-weyts-a9682f/friendster/dev',
      secret: 'CTt2&?QtVVUG$LcW3b;{xPXt3ZPnQ88W',
      debug: true
    })
  })
});

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
