require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());
const axios = require("axios");

const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "order"
});

db.connect((err) => {
    if (err) {
        console.error("DB connection failed:", err);
    } else {
        console.log("Connected to order_db");
    }
});

app.get("/test-db", (req, res) => {
    db.query("SELECT 1", (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json({ message: "DB OK", result });
    });
});

app.get("/", (req, res) => {
    res.send("Order service running");
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`Order service running on ${PORT}`);
});

app.post("/api/orders", async (req, res) => {
    try {
        const { restaurantId, items } = req.body;

        // 1. Validasi restaurant
        const restaurantRes = await axios.get(
            `${process.env.RESTAURANT_SERVICE_URL}/api/restaurants/${restaurantId}`
        );

        const restaurant = restaurantRes.data;

        // 2. Hitung total harga
        let total = 0;
        items.forEach((item) => {
            total += item.price;
        });

        // 3. Proses payment
        const paymentRes = await axios.post(
            `${process.env.PAYMENT_SERVICE_URL}/api/payments/process`,
            { amount: total }
        );

        // 4. SIMPAN KE DB 🔥
        db.query(
            "INSERT INTO orders (restaurant_id, total, status) VALUES (?, ?, ?)",
            [restaurantId, total, "PAID"],
            (err, result) => {
                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    message: "Order success",
                    orderId: result.insertId,
                    restaurant,
                    total,
                    payment: paymentRes.data,
                });
            }
        );

    } catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
});