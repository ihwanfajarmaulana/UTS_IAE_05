const { gql } = require('graphql-tag');

const paymentTypeDefs = gql`
    type Payment {
        id: ID!
        order_id: String!
        amount: Float!
        status: String!
        created_at: String
    }

    type PaymentResult {
        message: String!
        data: Payment
    }

    type Query {
        # Ambil semua pembayaran
        payments: [Payment!]!
        # Ambil pembayaran by ID
        payment(id: ID!): Payment
        # Ambil pembayaran by Order ID
        paymentsByOrder(orderId: String!): [Payment!]!
    }

    type Mutation {
        # Proses pembayaran baru
        processPayment(orderId: String!, amount: Float!): PaymentResult!
        # Update status pembayaran
        updatePaymentStatus(id: ID!, status: String!): PaymentResult!
        # Refund pembayaran
        refundPayment(id: ID!): PaymentResult!
    }
`;

module.exports = paymentTypeDefs;