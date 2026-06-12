require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const mysql = require("mysql2/promise");

const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");

const restaurantTypeDefs = require("./graphql/typeDefs/restaurantTypeDefs");
const restaurantResolvers = require("./graphql/resolvers/restaurantResolvers");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "views")));

const pool = mysql.createPool({
  host: process.env.DB_HOST || "restaurant-db",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "rahasia123",
  database: process.env.DB_DATABASE || process.env.DB_NAME || "restaurant_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/* =========================
   WEBSITE ROUTES
========================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

/* =========================
   REST API UNTUK INTEGRASI SERVICE LAIN
   Order service biasanya masih butuh endpoint ini
========================= */

app.get("/api/restaurants", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM restaurants ORDER BY id DESC"
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data restoran",
      error: error.message,
    });
  }
});

app.get("/api/restaurants/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM restaurants WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Restoran tidak ditemukan",
      });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil detail restoran",
      error: error.message,
    });
  }
});

app.get("/api/restaurants/:id/menus", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM menus WHERE restaurant_id = ? ORDER BY id DESC",
      [id]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil menu restoran",
      error: error.message,
    });
  }
});

/* =========================
   GRAPHQL SERVER
========================= */

async function startServer() {
  try {
    const conn = await pool.getConnection();
    console.log("Berhasil konek ke database MySQL (Restaurant DB)!");
    conn.release();

    const server = new ApolloServer({
      typeDefs: restaurantTypeDefs,
      resolvers: restaurantResolvers,
      introspection: true,
    });

    await server.start();

    app.use("/graphql", expressMiddleware(server));

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Restaurant Service berjalan di http://localhost:${PORT}`);
      console.log(`Website Dashboard: http://localhost:${PORT}`);
      console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error("Gagal menjalankan Restaurant Service:", error.message);
    process.exit(1);
  }
}

startServer();