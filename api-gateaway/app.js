const { ApolloServer } = require('@apollo/server');
const { ApolloGateway, IntrospectAndCompose } = require('@apollo/gateway');
const { expressMiddleware } = require('@apollo/server/express4');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
        subgraphs: [
            { name: 'restaurant', url: 'http://restaurant-service:3315/graphql' },
            { name: 'order', url: 'http://order-service:3316/graphql' },
            { name: 'payment', url: 'http://payment-service:3317/graphql' },
            { name: 'delivery', url: 'http://delivery-service:3318/graphql' }
        ],
    }),
});

const server = new ApolloServer({ gateway });

async function startGateway() {
    await server.start();
    app.use('/graphql', expressMiddleware(server));
    app.listen(4000, '0.0.0.0', () => {
        console.log('API Gateway berjalan di http://localhost:4000/graphql');
    });
}

startGateway();