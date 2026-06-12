const pool = require('../../db');

function mapOrder(row) {
    if (!row) return null;
    return {
        ...row,
        total: Number(row.total),
    };
}

const orderResolvers = {
    Query: {
        orders: async () => {
            const [rows] = await pool.query('SELECT * FROM orders ORDER BY id DESC');
            return rows.map(mapOrder);
        },

        order: async (_, { id }) => {
            const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
            if (rows.length === 0) throw new Error('Order tidak ditemukan');
            return mapOrder(rows[0]);
        },

        ordersByRestaurant: async (_, { restaurantId }) => {
            const [rows] = await pool.query(
                'SELECT * FROM orders WHERE restaurant_id = ? ORDER BY id DESC',
                [restaurantId]
            );
            return rows.map(mapOrder);
        },
    },

    Mutation: {
        createOrder: async (_, { restaurantId, total, status }) => {
            if (!restaurantId) throw new Error('restaurantId wajib diisi');
            if (total === undefined || total === null || Number(total) <= 0) {
                throw new Error('total wajib diisi dan harus lebih dari 0');
            }

            const orderStatus = status || 'PENDING';
            const [result] = await pool.query(
                'INSERT INTO orders (restaurant_id, total, status) VALUES (?, ?, ?)',
                [restaurantId, total, orderStatus]
            );
            const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [result.insertId]);

            return { message: 'Order berhasil dibuat', data: mapOrder(rows[0]) };
        },

        updateOrderStatus: async (_, { id, status }) => {
            if (!status) throw new Error('status wajib diisi');

            const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
            if (result.affectedRows === 0) throw new Error('Order tidak ditemukan');

            const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
            return { message: 'Status order berhasil diperbarui', data: mapOrder(rows[0]) };
        },

        deleteOrder: async (_, { id }) => {
            const [existing] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
            if (existing.length === 0) throw new Error('Order tidak ditemukan');

            await pool.query('DELETE FROM orders WHERE id = ?', [id]);
            return { message: 'Order berhasil dihapus', data: mapOrder(existing[0]) };
        },
    },
};

module.exports = orderResolvers;
