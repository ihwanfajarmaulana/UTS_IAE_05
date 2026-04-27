require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Service running on port ${PORT}`);
});

app.post("/api/payments/process", (req, res) => {
  const { amount } = req.body;

  res.json({
    status: "SUCCESS",
    amount,
    transactionId: Date.now(),
  });
});