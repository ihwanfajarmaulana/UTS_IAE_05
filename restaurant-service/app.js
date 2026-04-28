require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "restaurant_db",
});

pool.getConnection()
  .then(conn => {
    console.log("Database connected successfully");
    conn.release();
  })
  .catch(err => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });
  
app.listen(PORT, () => {
  console.log(`Service running on port ${PORT}`);
});

// ===== RESTAURANTS =====

// GET /api/restaurants - Ambil semua restoran
app.get("/api/restaurants", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM restaurants");
  res.json(rows);
});

// GET /api/restaurants/:id - Ambil detail restoran
app.get("/api/restaurants/:id", async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query("SELECT * FROM restaurants WHERE id = ?", [id]);

  if (rows.length === 0) {
    return res.status(404).json({ message: "Restoran tidak ditemukan" });
  }

  res.json(rows[0]);
});

// POST /api/restaurants - Tambah restoran baru
app.post("/api/restaurants", async (req, res) => {
  const { name } = req.body;
  const [result] = await pool.query("INSERT INTO restaurants (name) VALUES (?)", [name]);
  const [newData] = await pool.query("SELECT * FROM restaurants WHERE id = ?", [result.insertId]);

  res.status(201).json(newData[0]);
});

// PUT /api/restaurants/:id - Update restoran
app.put("/api/restaurants/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  await pool.query("UPDATE restaurants SET name = ? WHERE id = ?", [name, id]);
  const [updated] = await pool.query("SELECT * FROM restaurants WHERE id = ?", [id]);

  res.json(updated[0]);
});

// DELETE /api/restaurants/:id - Hapus restoran
app.delete("/api/restaurants/:id", async (req, res) => {
  const { id } = req.params;
  const [existing] = await pool.query("SELECT * FROM restaurants WHERE id = ?", [id]);
  await pool.query("DELETE FROM restaurants WHERE id = ?", [id]);

  res.json({ message: "Restoran berhasil dihapus", data: existing[0] });
});

// GET /api/restaurants/:id/menus - Ambil menu restoran
app.get("/api/restaurants/:id/menus", async (req, res) => {
  const { id } = req.params;
  const [menus] = await pool.query("SELECT * FROM menus WHERE restaurant_id = ?", [id]);

  res.json(menus);
});

// ===== MENUS =====

// POST /api/menus - Tambah menu
app.post("/api/menus", async (req, res) => {
  const { restaurant_id, name, price } = req.body;
  const [result] = await pool.query(
    "INSERT INTO menus (restaurant_id, name, price) VALUES (?, ?, ?)",
    [restaurant_id, name, price]
  );
  const [newMenu] = await pool.query("SELECT * FROM menus WHERE id = ?", [result.insertId]);

  res.status(201).json(newMenu[0]);
});

// PUT /api/menus/:id - Update menu
app.put("/api/menus/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  await pool.query("UPDATE menus SET name = ?, price = ? WHERE id = ?", [name, price, id]);
  const [updated] = await pool.query("SELECT * FROM menus WHERE id = ?", [id]);

  res.json(updated[0]);
});

// DELETE /api/menus/:id - Hapus menu
app.delete("/api/menus/:id", async (req, res) => {
  const { id } = req.params;
  const [existing] = await pool.query("SELECT * FROM menus WHERE id = ?", [id]);
  await pool.query("DELETE FROM menus WHERE id = ?", [id]);

  res.json({ message: "Menu berhasil dihapus", data: existing[0] });
});