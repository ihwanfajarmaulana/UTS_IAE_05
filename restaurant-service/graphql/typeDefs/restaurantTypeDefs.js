const { gql } = require('graphql-tag');

const restaurantTypeDefs = gql`
    type Restaurant {
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
        # Ambil semua restoran
        restaurants: [Restaurant!]!
        # Ambil restoran berdasarkan ID
        restaurant(id: ID!): Restaurant
        # Ambil semua menu
        menus: [Menu!]!
        # Ambil menu berdasarkan ID
        menu(id: ID!): Menu
        # Ambil menu berdasarkan restaurant_id
        menusByRestaurant(restaurantId: ID!): [Menu!]!
    }

    type Mutation {
        # Tambah restoran baru
        addRestaurant(name: String!): RestaurantResult!
        # Update restoran
        updateRestaurant(id: ID!, name: String!): RestaurantResult!
        # Hapus restoran
        deleteRestaurant(id: ID!): RestaurantResult!
        # Tambah menu baru
        addMenu(restaurantId: ID!, name: String!, price: Int!): MenuResult!
        # Update menu
        updateMenu(id: ID!, name: String, price: Int): MenuResult!
        # Hapus menu
        deleteMenu(id: ID!): MenuResult!
    }
`;

module.exports = restaurantTypeDefs;
