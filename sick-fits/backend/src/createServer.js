const { GraphQLServer } = require("graphql-yoga");
//query, mutation resolvers
const Mutation = require("./resolvers/Mutation");
const Query = require("./resolvers/Query");
const db = require("./db");

//Prisma Server & GraphQLServer
function createServer() {
  return new GraphQLServer({
    typeDefs: "src/schema.graphql",
    resolvers: {
      Mutation,
      Query
    },
    resolverValidationOptions: {
      requireResolversForResolveType: false
    },
    playground: {
      settings: {
        "request.credentials": "include"
      }
    },
    //access database via resolvers, expose the db instance to every request
    context: request => ({ ...request, db })
  });
}

module.exports = createServer;
