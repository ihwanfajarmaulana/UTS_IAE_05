require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT || 3001;

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
    console.log("Berhasil konek ke database MySQL (Restaurant DB)!");
    conn.release();
  })
  .catch(err => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log(`Service running on port ${PORT}`);
});

app.get("/api/restaurants", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM restaurants");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

app.get("/api/restaurants/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM restaurants WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Restoran tidak ditemukan" });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

app.post("/api/restaurants", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Nama restoran wajib diisi" });

    const [result] = await pool.query("INSERT INTO restaurants (name) VALUES (?)", [name]);
    const [newData] = await pool.query("SELECT * FROM restaurants WHERE id = ?", [result.insertId]);

    res.status(201).json(newData[0]);
  } catch (error) {
    res.status(500).json({ message: "Gagal menambah restoran", error: error.message });
  }
});

app.put("/api/restaurants/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const [existing] = await pool.query("SELECT * FROM restaurants WHERE id = ?", [id]);
    if (existing.length === 0) return res.status(404).json({ message: "Restoran tidak ditemukan" });

    await pool.query("UPDATE restaurants SET name = ? WHERE id = ?", [name, id]);
    const [updated] = await pool.query("SELECT * FROM restaurants WHERE id = ?", [id]);

    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ message: "Gagal update restoran", error: error.message });
  }
});

app.delete("/api/restaurants/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query("SELECT * FROM restaurants WHERE id = ?", [id]);
    
    if (existing.length === 0) return res.status(404).json({ message: "Restoran tidak ditemukan" });

    await pool.query("DELETE FROM restaurants WHERE id = ?", [id]);
    res.json({ message: "Restoran berhasil dihapus", data: existing[0] });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus restoran", error: error.message });
  }
});

app.get("/api/restaurants/:id/menus", async (req, res) => {
  try {
    const { id } = req.params;
    const [menus] = await pool.query("SELECT * FROM menus WHERE restaurant_id = ?", [id]);
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

app.post("/api/menus", async (req, res) => {
  try {
    const { restaurant_id, name, price } = req.body;
    if (!restaurant_id || !name || !price) {
      return res.status(400).json({ message: "Semua field (restaurant_id, name, price) wajib diisi" });
    }

    const [result] = await pool.query(
      "INSERT INTO menus (restaurant_id, name, price) VALUES (?, ?, ?)",
      [restaurant_id, name, price]
    );
    const [newMenu] = await pool.query("SELECT * FROM menus WHERE id = ?", [result.insertId]);

    res.status(201).json(newMenu[0]);
  } catch (error) {
    res.status(500).json({ message: "Gagal menambah menu", error: error.message });
  }
});

app.put("/api/menus/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    const [existing] = await pool.query("SELECT * FROM menus WHERE id = ?", [id]);
    if (existing.length === 0) return res.status(404).json({ message: "Menu tidak ditemukan" });

    await pool.query("UPDATE menus SET name = ?, price = ? WHERE id = ?", [name, price, id]);
    const [updated] = await pool.query("SELECT * FROM menus WHERE id = ?", [id]);

    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ message: "Gagal update menu", error: error.message });
  }
});

app.delete("/api/menus/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query("SELECT * FROM menus WHERE id = ?", [id]);
    
    if (existing.length === 0) return res.status(404).json({ message: "Menu tidak ditemukan" });

    await pool.query("DELETE FROM menus WHERE id = ?", [id]);
    res.json({ message: "Menu berhasil dihapus", data: existing[0] });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus menu", error: error.message });
  }
});