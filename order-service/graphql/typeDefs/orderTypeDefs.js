const { gql } = require('graphql-tag');

const orderTypeDefs = gql`
    extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@external"])

    type Order @key(fields: "id") {
        id: ID!
        restaurant_id: ID!
        total: Float!
        status: String!
        created_at: String
        updated_at: String
        restaurant: Restaurant
    }

    extend type Restaurant @key(fields: "id") {
        id: ID! @external
    }

    type OrderResult {
        message: String!
        data: Order
    }

    type DeleteOrderResult {
        message: String!
        data: Order
    }

    type Query {
        orders: [Order!]!
        order(id: ID!): Order
        ordersByRestaurant(restaurantId: ID!): [Order!]!
    }

    type Mutation {
        createOrder(restaurantId: ID!, total: Float!, status: String): OrderResult!
        updateOrderStatus(id: ID!, status: String!): OrderResult!
        deleteOrder(id: ID!): DeleteOrderResult!
    }
`;

module.exports = orderTypeDefs;