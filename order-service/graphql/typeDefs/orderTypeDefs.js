const { gql } = require('graphql-tag');

const orderTypeDefs = gql`
    type Order {
        id: ID!
        restaurant_id: ID!
        total: Float!
        status: String!
        created_at: String
        updated_at: String
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
        # Ambil semua order
        orders: [Order!]!
        # Ambil order berdasarkan ID
        order(id: ID!): Order
        # Ambil order berdasarkan restaurant_id
        ordersByRestaurant(restaurantId: ID!): [Order!]!
    }

    type Mutation {
        # Buat order baru
        createOrder(restaurantId: ID!, total: Float!, status: String): OrderResult!
        # Update status order
        updateOrderStatus(id: ID!, status: String!): OrderResult!
        # Hapus order
        deleteOrder(id: ID!): DeleteOrderResult!
    }
`;

module.exports = orderTypeDefs;
