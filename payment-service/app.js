require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js'); // Hanya butuh supabase, hapus mysql2

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
    console.log("Mencoba menghubungi Supabase...");
    try {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Gagal terhubung ke Supabase. Cek URL dan Key kamu!');
            console.error('Pesan Error:', error.message);
            return;
        }

        console.log('✅ Berhasil terhubung ke database Supabase!');
        console.log('Status Tabel Payments:', data.length === 0 ? 'Tabel kosong (siap diisi)' : 'Tabel sudah ada isinya');
        
    } catch (err) {
        console.error('❌ Terjadi kesalahan sistem/jaringan:', err.message);
    }
}

testDatabaseConnection();

// 1. Proses pembayaran (POST /api/payments/process)
app.post('/api/payments/process', async (req, res) => {
    try {
        const { orderId, amount } = req.body;
        
        if (!orderId || !amount) {
            return res.status(400).json({ error: "orderId dan amount wajib diisi" });
        }

        const status = 'Success'; 
        
        // Insert menggunakan Supabase
        const { data, error } = await supabase
            .from('payments')
            .insert([{ order_id: orderId, amount: amount, status: status }])
            .select();

        if (error) throw error;

        res.status(201).json({
            message: "Pembayaran berhasil diproses",
            data: {
                id: data[0].id,
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
        const { data, error } = await supabase.from('payments').select('*');
        if (error) throw error;
        
        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: "Terjadi kesalahan server: " + error.message });
    }
});

// 3. Detail transaksi (GET /api/payments/:id)
app.get('/api/payments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: "Transaksi tidak ditemukan" });
            }
            throw error;
        }
        
        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: "Terjadi kesalahan server: " + error.message });
    }
});

// 4. Transaksi berdasarkan order (GET /api/payments/order/:orderId)
app.get('/api/payments/order/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('order_id', orderId);
        
        if (error) throw error;
        
        res.status(200).json({ data });
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

        const { data, error } = await supabase
            .from('payments')
            .update({ status: status })
            .eq('id', id)
            .select();

        if (error) throw error;

        if (data.length === 0) {
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

        const { data, error } = await supabase
            .from('payments')
            .update({ status: refundStatus })
            .eq('id', id)
            .select();

        if (error) throw error;

        if (data.length === 0) {
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