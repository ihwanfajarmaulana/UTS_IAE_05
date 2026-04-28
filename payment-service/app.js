require('dotenv').config();

console.log(process.env.DB_PASSWORD);

const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

// Konfigurasi Database
const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'payment_db'
});

// Test Koneksi Database
pool.getConnection()
    .then(() => console.log('✅ Terhubung ke database payment_db'))
    .catch((err) => console.error('❌ Gagal terhubung ke database:', err.message));

// 1. Proses pembayaran (POST /api/payments/process)
app.post('/api/payments/process', async (req, res) => {
    try {
        const { orderId, amount } = req.body;
        
        if (!orderId || !amount) {
            return res.status(400).json({ error: "orderId dan amount wajib diisi" });
        }

        const status = 'Success'; 
        
        const [result] = await pool.query(
            'INSERT INTO payments (order_id, amount, status) VALUES (?, ?, ?)',
            [orderId, amount, status]
        );

        res.status(201).json({
            message: "Pembayaran berhasil diproses",
            data: {
                id: result.insertId,
                orderId,
                amount,
                status
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Terjadi kesalahan server: " + error.message });
    }
});

// 2. Ambil semua transaksi (GET /api/payments)
app.get('/api/payments', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM payments');
        res.status(200).json({ data: rows });
    } catch (error) {
        res.status(500).json({ error: "Terjadi kesalahan server: " + error.message });
    }
});

// 3. Detail transaksi (GET /api/payments/:id)
app.get('/api/payments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM payments WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: "Transaksi tidak ditemukan" });
        }
        
        res.status(200).json({ data: rows[0] });
    } catch (error) {
        res.status(500).json({ error: "Terjadi kesalahan server: " + error.message });
    }
});

// 4. Transaksi berdasarkan order (GET /api/payments/order/:orderId)
app.get('/api/payments/order/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const [rows] = await pool.query('SELECT * FROM payments WHERE order_id = ?', [orderId]);
        
        res.status(200).json({ data: rows });
    } catch (error) {
        res.status(500).json({ error: "Terjadi kesalahan server: " + error.message });
    }
});

// 5. Update status pembayaran (PUT /api/payments/:id/status)
app.put('/api/payments/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: "Field 'status' wajib dikirimkan dalam body request" });
        }

        const [result] = await pool.query(
            'UPDATE payments SET status = ? WHERE id = ?',
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Transaksi tidak ditemukan" });
        }

        res.status(200).json({ 
            message: "Status pembayaran berhasil diperbarui", 
            data: { id, status }
        });
    } catch (error) {
        res.status(500).json({ error: "Terjadi kesalahan server: " + error.message });
    }
});

// 6. Refund pembayaran (POST /api/payments/:id/refund)
app.post('/api/payments/:id/refund', async (req, res) => {
    try {
        const { id } = req.params;
        const refundStatus = 'Refunded';

        const [result] = await pool.query(
            'UPDATE payments SET status = ? WHERE id = ?',
            [refundStatus, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Transaksi tidak ditemukan" });
        }

        res.status(200).json({ 
            message: "Pembayaran berhasil di-refund", 
            data: { id, status: refundStatus }
        });
    } catch (error) {
        res.status(500).json({ error: "Terjadi kesalahan server: " + error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Payment Service berjalan di http://localhost:${PORT}`);
});

