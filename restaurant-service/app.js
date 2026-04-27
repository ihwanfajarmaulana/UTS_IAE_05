require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Service running on port ${PORT}`);
});

app.get("/api/restaurants/:id", (req, res) => {
  const { id } = req.params;

  res.json({
    id,
    name: "Restaurant A",
    menu: [
      { id: 1, name: "Nasi Goreng", price: 15000 },
      { id: 2, name: "Mie Ayam", price: 12000 },
    ],
  });
});