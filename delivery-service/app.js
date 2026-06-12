require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");

const deliveryTypeDefs = require("./graphql/typeDefs/deliveryTypeDefs");
const deliveryResolvers = require("./graphql/resolvers/deliveryResolvers");

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

async function startServer() {
  const server = new ApolloServer({
    typeDefs: deliveryTypeDefs,
    resolvers: deliveryResolvers,
    introspection: true,
  });

  await server.start();

  app.use("/graphql", expressMiddleware(server));

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Delivery Service berjalan di http://localhost:${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
}

startServer();