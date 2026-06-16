const { gql } = require('graphql-tag');

const restaurantTypeDefs = gql`
    extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key"])

    type Restaurant @key(fields: "id") {
        id: ID!
        name: String!
        created_at: String
        updated_at: String
        menus: [Menu!]
    }

    type Menu {
        id: ID!
        restaurant_id: ID!
        name: String!
        price: Int!
        created_at: String
        updated_at: String
        restaurant: Restaurant
    }

    type RestaurantResult {
        message: String!
        data: Restaurant
    }

    type MenuResult {
        message: String!
        data: Menu
    }

    type Query {
        restaurants: [Restaurant!]!
        restaurant(id: ID!): Restaurant
        menus: [Menu!]!
        menu(id: ID!): Menu
        menusByRestaurant(restaurantId: ID!): [Menu!]!
    }

    type Mutation {
        addRestaurant(name: String!): RestaurantResult!
        updateRestaurant(id: ID!, name: String!): RestaurantResult!
        deleteRestaurant(id: ID!): RestaurantResult!
        addMenu(restaurantId: ID!, name: String!, price: Int!): MenuResult!
        updateMenu(id: ID!, name: String, price: Int): MenuResult!
        deleteMenu(id: ID!): MenuResult!
    }
`;

module.exports = restaurantTypeDefs;