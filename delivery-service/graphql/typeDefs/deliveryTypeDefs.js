const { gql } = require('graphql-tag');

const deliveryTypeDefs = gql`
    extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@external"])

    type Delivery @key(fields: "id") {
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
        order: Order
    }

    extend type Order @key(fields: "id") {
        id: ID! @external
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
        deliveries: [Delivery!]!
        delivery(id: ID!): Delivery
        trackDelivery(id: ID!): Delivery
        deliveriesByCourier(courierId: ID!): [Delivery!]!
    }

    type Mutation {
        createDelivery(
            orderId: ID!
            courierId: ID
            address: String
            recipientName: String
            recipientPhone: String
        ): DeliveryResult!
        assignCourier(deliveryId: ID!, courierId: ID!): DeliveryResult!
        updateDeliveryStatus(deliveryId: ID!, status: String!): DeliveryResult!
        updateDelivery(id: ID!, address: String, recipientName: String, recipientPhone: String): DeliveryResult!
        completeDelivery(id: ID!): DeliveryResult!
        deleteDelivery(id: ID!): DeleteDeliveryResult!
    }
`;

module.exports = deliveryTypeDefs;