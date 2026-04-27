require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());
const axios = require("axios");

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

        // 4. Response
        res.json({
            message: "Order success",
            restaurant,
            total,
            payment: paymentRes.data,
        });

    } catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
});