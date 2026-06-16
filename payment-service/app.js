require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { buildSubgraphSchema } = require('@apollo/subgraph');

const paymentTypeDefs = require('./graphql/typeDefs/paymentTypeDefs');
const paymentResolvers = require('./graphql/resolvers/paymentResolvers');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

async function startServer() {
    const server = new ApolloServer({
        schema: buildSubgraphSchema({ typeDefs: paymentTypeDefs, resolvers: paymentResolvers }),
        introspection: true,
    });

    await server.start();

    app.use('/graphql', expressMiddleware(server));

    app.listen(PORT, () => {
        console.log(`Payment Service berjalan di http://localhost:${PORT}`);
        console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
    });
}

startServer();