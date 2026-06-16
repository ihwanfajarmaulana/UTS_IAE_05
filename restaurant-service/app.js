require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { buildSubgraphSchema } = require('@apollo/subgraph');

const restaurantTypeDefs = require('./graphql/typeDefs/restaurantTypeDefs');
const restaurantResolvers = require('./graphql/resolvers/restaurantResolvers');

const app = express();
const PORT = process.env.PORT || 3315;

app.use(cors());
app.use(express.json());

async function startServer() {
    const server = new ApolloServer({
        schema: buildSubgraphSchema({ typeDefs: restaurantTypeDefs, resolvers: restaurantResolvers }),
        introspection: true,
    });

    await server.start();

    app.use('/graphql', expressMiddleware(server));

    app.listen(PORT, () => {
        console.log(`Restaurant Service berjalan di http://localhost:${PORT}`);
        console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
    });
}

startServer();