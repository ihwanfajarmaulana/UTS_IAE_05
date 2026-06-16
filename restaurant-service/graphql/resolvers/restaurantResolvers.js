const pool = require('../../db');

async function getRestaurantById(id) {
    const [rows] = await pool.query('SELECT * FROM restaurants WHERE id = ?', [id]);
    return rows[0] || null;
}

async function getMenuById(id) {
    const [rows] = await pool.query('SELECT * FROM menus WHERE id = ?', [id]);
    return rows[0] || null;
}

const restaurantResolvers = {
    Restaurant: {
        __resolveReference: async (restaurantRef) => {
            return await getRestaurantById(restaurantRef.id);
        },
        menus: async (parent) => {
            const [rows] = await pool.query('SELECT * FROM menus WHERE restaurant_id = ?', [parent.id]);
            return rows;
        },
    },

    Menu: {
        restaurant: async (parent) => getRestaurantById(parent.restaurant_id),
    },

    Query: {
        restaurants: async () => {
            const [rows] = await pool.query('SELECT * FROM restaurants ORDER BY id DESC');
            return rows;
        },
        restaurant: async (_, { id }) => {
            const restaurant = await getRestaurantById(id);
            if (!restaurant) throw new Error('Restoran tidak ditemukan');
            return restaurant;
        },
        menus: async () => {
            const [rows] = await pool.query('SELECT * FROM menus ORDER BY id DESC');
            return rows;
        },
        menu: async (_, { id }) => {
            const menu = await getMenuById(id);
            if (!menu) throw new Error('Menu tidak ditemukan');
            return menu;
        },
        menusByRestaurant: async (_, { restaurantId }) => {
            const [rows] = await pool.query(
                'SELECT * FROM menus WHERE restaurant_id = ? ORDER BY id DESC',
                [restaurantId]
            );
            return rows;
        },
    },

    Mutation: {
        addRestaurant: async (_, { name }) => {
            if (!name) throw new Error('Nama restoran wajib diisi');
            const [result] = await pool.query('INSERT INTO restaurants (name) VALUES (?)', [name]);
            const data = await getRestaurantById(result.insertId);
            return { message: 'Restoran berhasil ditambahkan', data };
        },
        updateRestaurant: async (_, { id, name }) => {
            const existing = await getRestaurantById(id);
            if (!existing) throw new Error('Restoran tidak ditemukan');
            if (!name) throw new Error('Nama restoran wajib diisi');
            await pool.query('UPDATE restaurants SET name = ? WHERE id = ?', [name, id]);
            const data = await getRestaurantById(id);
            return { message: 'Restoran berhasil diperbarui', data };
        },
        deleteRestaurant: async (_, { id }) => {
            const existing = await getRestaurantById(id);
            if (!existing) throw new Error('Restoran tidak ditemukan');
            await pool.query('DELETE FROM restaurants WHERE id = ?', [id]);
            return { message: 'Restoran berhasil dihapus', data: existing };
        },
        addMenu: async (_, { restaurantId, name, price }) => {
            const restaurant = await getRestaurantById(restaurantId);
            if (!restaurant) throw new Error('Restoran tidak ditemukan');
            if (!name) throw new Error('Nama menu wajib diisi');
            if (price === undefined || price === null || Number(price) <= 0) {
                throw new Error('Harga menu wajib diisi dan harus lebih dari 0');
            }
            const [result] = await pool.query(
                'INSERT INTO menus (restaurant_id, name, price) VALUES (?, ?, ?)',
                [restaurantId, name, price]
            );
            const data = await getMenuById(result.insertId);
            return { message: 'Menu berhasil ditambahkan', data };
        },
        updateMenu: async (_, { id, name, price }) => {
            const existing = await getMenuById(id);
            if (!existing) throw new Error('Menu tidak ditemukan');
            const newName = name !== undefined && name !== null ? name : existing.name;
            const newPrice = price !== undefined && price !== null ? price : existing.price;
            if (!newName) throw new Error('Nama menu tidak boleh kosong');
            if (Number(newPrice) <= 0) throw new Error('Harga menu harus lebih dari 0');
            await pool.query('UPDATE menus SET name = ?, price = ? WHERE id = ?', [newName, newPrice, id]);
            const data = await getMenuById(id);
            return { message: 'Menu berhasil diperbarui', data };
        },
        deleteMenu: async (_, { id }) => {
            const existing = await getMenuById(id);
            if (!existing) throw new Error('Menu tidak ditemukan');
            await pool.query('DELETE FROM menus WHERE id = ?', [id]);
            return { message: 'Menu berhasil dihapus', data: existing };
        },
    },
};

module.exports = restaurantResolvers;