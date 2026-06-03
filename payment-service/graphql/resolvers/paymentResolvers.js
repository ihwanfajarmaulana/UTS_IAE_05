// graphql/resolvers/paymentResolvers.js
const pool = require('../../db');

const paymentResolvers = {
    Query: {
        payments: async () => {
        const [rows] = await pool.query('SELECT * FROM payments');
        return rows;
        },

        payment: async (_, { id }) => {
        const [rows] = await pool.query(
            'SELECT * FROM payments WHERE id = ?', [id]
        );
        if (rows.length === 0) throw new Error('Transaksi tidak ditemukan');
        return rows[0];
        },

        paymentsByOrder: async (_, { orderId }) => {
        const [rows] = await pool.query(
            'SELECT * FROM payments WHERE order_id = ?', [orderId]
        );
        return rows;
        },
    },

    Mutation: {
        processPayment: async (_, { orderId, amount }) => {
        if (!orderId || !amount) {
            throw new Error('orderId dan amount wajib diisi');
        }
        const status = 'Success';
        const [result] = await pool.query(
            'INSERT INTO payments (order_id, amount, status) VALUES (?, ?, ?)',
            [orderId, amount, status]
        );
        const [rows] = await pool.query(
            'SELECT * FROM payments WHERE id = ?', [result.insertId]
        );
        return { message: 'Pembayaran berhasil diproses', data: rows[0] };
        },

        updatePaymentStatus: async (_, { id, status }) => {
        if (!status) throw new Error("Field 'status' wajib diisi");
        const [result] = await pool.query(
            'UPDATE payments SET status = ? WHERE id = ?', [status, id]
        );
        if (result.affectedRows === 0) throw new Error('Transaksi tidak ditemukan');
        const [rows] = await pool.query(
            'SELECT * FROM payments WHERE id = ?', [id]
        );
        return { message: 'Status pembayaran berhasil diperbarui', data: rows[0] };
        },

        refundPayment: async (_, { id }) => {
        const refundStatus = 'Refunded';
        const [result] = await pool.query(
            'UPDATE payments SET status = ? WHERE id = ?', [refundStatus, id]
        );
        if (result.affectedRows === 0) throw new Error('Transaksi tidak ditemukan');
        const [rows] = await pool.query(
            'SELECT * FROM payments WHERE id = ?', [id]
        );
        return { message: 'Pembayaran berhasil di-refund', data: rows[0] };
        },
    },
    };

module.exports = paymentResolvers;