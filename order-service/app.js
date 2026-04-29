require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());
const axios = require("axios");

const mysql = require("mysql2/promise");

const cors = require('cors');
app.use(cors());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then(conn => {
        console.log("Berhasil konek ke database MySQL (Order DB)!");
        conn.release();
    })
    .catch(err => {
        console.error("Gagal koneksi ke database:", err.message);
        process.exit(1);
    });

app.get("/test-db", async (req, res) => {
    try {
        const [result] = await pool.query("SELECT 1");
        res.json({ message: "DB OK", result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/", (req, res) => {
    res.send("Order service running");
});

const PORT = process.env.PORT || 3002;

app.get('/api/orders', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM orders ORDER BY id DESC");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gagal mengambil data order" });
    }
});

app.get('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query("SELECT * FROM orders WHERE id = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Order tidak ditemukan" });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gagal mengambil detail order" });
    }
});

app.listen(PORT, () => {
    console.log(`Order service running on ${PORT}`);
});


app.post("/api/orders", async (req, res) => {
    try {
        const { restaurantId, items } = req.body;

        const restaurantRes = await axios.get(
            `${process.env.RESTAURANT_SERVICE_URL}/api/restaurants/${restaurantId}`
        );
        const restaurant = restaurantRes.data;

        let total = 0;
        if (items && Array.isArray(items)) {
            items.forEach((item) => {
                total += item.price;
            });
        }

        const [orderResult] = await pool.query(
            "INSERT INTO orders (restaurant_id, total, status) VALUES (?, ?, ?)",
            [restaurantId, total, "PENDING"]
        );
        const newOrderId = orderResult.insertId;

        const paymentRes = await axios.post(
            `${process.env.PAYMENT_SERVICE_URL}/api/payments/process`,
            { 
                orderId: newOrderId,
                amount: total 
            }
        );

        await pool.query(
            "UPDATE orders SET status = ? WHERE id = ?",
            ["PAID", newOrderId]
        );

        res.status(201).json({
            message: "Order success",
            orderId: newOrderId,
            restaurant,
            total,
            payment: paymentRes.data,
        });

    } catch (err) {
        const errorMessage = err.response?.data || err.message;
        res.status(500).json({
            error: errorMessage,
        });
    }
});