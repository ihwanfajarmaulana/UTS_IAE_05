const { gql } = require('graphql-tag');

const deliveryTypeDefs = gql`
    type Delivery {
        id: ID!
        order_id: ID!
        courier_id: ID
        status: String!
        address: String
        recipient_name: String
        recipient_phone: String
        created_at: String
        updated_at: String
        status_description: String
    }

    type TrackingDelivery {
        id: ID!
        order_id: Int!
        courier_id: Int
        status: String!
        address: String
        recipient_name: String
        recipient_phone: String
        updated_at: String
        status_description: String
    }

    type DeliveryResult {
        message: String!
        data: Delivery
    }

    type DeleteDeliveryResult {
        message: String!
        data: Delivery
    }

    type Query {
        # Ambil semua delivery
        deliveries: [Delivery!]!
        # Ambil delivery berdasarkan ID
        delivery(id: ID!): Delivery
        # Tracking delivery berdasarkan ID
        trackDelivery(id: ID!): Delivery
        # Ambil delivery berdasarkan courier_id
        deliveriesByCourier(courierId: ID!): [Delivery!]!
    }

    type Mutation {
        # Buat delivery baru
        createDelivery(
            orderId: ID!
            courierId: ID
            address: String
            recipientName: String
            recipientPhone: String
        ): DeliveryResult!
        # Assign kurir ke delivery
        assignCourier(deliveryId: ID!, courierId: ID!): DeliveryResult!
        # Update status delivery
        updateDeliveryStatus(deliveryId: ID!, status: String!): DeliveryResult!
        # Update detail alamat penerima
        updateDelivery(id: ID!, address: String, recipientName: String, recipientPhone: String): DeliveryResult!
        # Selesaikan delivery
        completeDelivery(id: ID!): DeliveryResult!
        # Hapus delivery
        deleteDelivery(id: ID!): DeleteDeliveryResult!
    }
`;

module.exports = deliveryTypeDefs;
