const { gql } = require('graphql-tag');

const paymentTypeDefs = gql`
    extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@external"])

    type Payment @key(fields: "id") {
        id: ID!
        order_id: String!
        amount: Float!
        status: String!
        created_at: String
        order: Order
    }

    extend type Order @key(fields: "id") {
        id: ID! @external
    }

    type PaymentResult {
        message: String!
        data: Payment
    }

    type Query {
        payments: [Payment!]!
        payment(id: ID!): Payment
        paymentsByOrder(orderId: String!): [Payment!]!
    }

    type Mutation {
        processPayment(orderId: String!, amount: Float!): PaymentResult!
        updatePaymentStatus(id: ID!, status: String!): PaymentResult!
        refundPayment(id: ID!): PaymentResult!
    }
`;

module.exports = paymentTypeDefs;