require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,               
    user: process.env.DB_USERNAME,                   
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,               
    waitForConnections: true,                        
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Gagal koneksi ke database:", err.message);
    process.exit(1);
  }
  console.log("Berhasil konek ke database MySQL (Delivery DB)!");
  connection.release();
});

app.get("/", (req, res) => {
  res.send("Delivery Service is running on port 3004");
});

app.post("/api/delivery", (req, res) => {
  const { order_id, courier_id, address, recipient_name, recipient_phone } = req.body;

  if (!order_id) {
    return res.status(400).json({ success: false, message: "order_id wajib diisi" });
  }

  const status = "pending";
  const sql = `INSERT INTO deliveries (order_id, courier_id, status, address, recipient_name, recipient_phone) 
                VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(sql, [order_id, courier_id || null, status, address || null, recipient_name || null, recipient_phone || null], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Gagal membuat delivery", error: err.message });
    }
    res.status(201).json({
      success: true,
      message: "Delivery berhasil dibuat",
      data: {
        id: result.insertId,
        order_id,
        courier_id: courier_id || null,
        status,
        address: address || null,
        recipient_name: recipient_name || null,
        recipient_phone: recipient_phone || null,
      },
    });
  });
});

app.get("/api/delivery", (req, res) => {
  const sql = "SELECT * FROM deliveries ORDER BY id DESC";

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Gagal mengambil data delivery", error: err.message });
    }
    res.json({
      success: true,
      message: "Data semua delivery",
      total: results.length,
      data: results,
    });
  });
});

app.get("/api/delivery/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM deliveries WHERE id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Gagal mengambil detail delivery", error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Delivery tidak ditemukan" });
    }
    res.json({
      success: true,
      message: "Detail delivery",
      data: results[0],
    });
  });
});

app.post("/api/delivery/assign", (req, res) => {
  const { delivery_id, courier_id } = req.body;

  if (!delivery_id || !courier_id) {
    return res.status(400).json({ success: false, message: "delivery_id dan courier_id wajib diisi" });
  }

  db.query("SELECT * FROM deliveries WHERE id = ?", [delivery_id], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Gagal cek delivery", error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Delivery tidak ditemukan" });
    }

    const sql = "UPDATE deliveries SET courier_id = ?, status = 'assigned' WHERE id = ?";
    db.query(sql, [courier_id, delivery_id], (err2) => {
      if (err2) {
        return res.status(500).json({ success: false, message: "Gagal assign kurir", error: err2.message });
      }
      res.json({
        success: true,
        message: `Kurir ${courier_id} berhasil di-assign ke delivery ${delivery_id}`,
        data: { delivery_id, courier_id, status: "assigned" },
      });
    });
  });
});


app.put("/api/delivery/status", (req, res) => {
  const { delivery_id, status } = req.body;

  const validStatuses = ["pending", "assigned", "picked_up", "on_the_way", "delivered", "failed"];
  if (!delivery_id || !status) {
    return res.status(400).json({ success: false, message: "delivery_id dan status wajib diisi" });
  }
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Status tidak valid. Pilihan: ${validStatuses.join(", ")}`,
    });
  }

  db.query("SELECT * FROM deliveries WHERE id = ?", [delivery_id], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Gagal cek delivery", error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Delivery tidak ditemukan" });
    }

    db.query("UPDATE deliveries SET status = ? WHERE id = ?", [status, delivery_id], (err2) => {
      if (err2) {
        return res.status(500).json({ success: false, message: "Gagal update status", error: err2.message });
      }
      res.json({
        success: true,
        message: `Status delivery berhasil diupdate menjadi '${status}'`,
        data: { delivery_id, status },
      });
    });
  });
});


app.put("/api/delivery/:id", (req, res) => {
  const { id } = req.params;
  const { address, recipient_name, recipient_phone } = req.body;

  db.query("SELECT * FROM deliveries WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Gagal cek delivery", error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Delivery tidak ditemukan" });
    }

    const current = results[0];
    const newAddress = address !== undefined ? address : current.address;
    const newRecipientName = recipient_name !== undefined ? recipient_name : current.recipient_name;
    const newRecipientPhone = recipient_phone !== undefined ? recipient_phone : current.recipient_phone;

    const sql = "UPDATE deliveries SET address = ?, recipient_name = ?, recipient_phone = ? WHERE id = ?";
    db.query(sql, [newAddress, newRecipientName, newRecipientPhone, id], (err2) => {
      if (err2) {
        return res.status(500).json({ success: false, message: "Gagal update delivery", error: err2.message });
      }
      res.json({
        success: true,
        message: "Detail delivery berhasil diupdate",
        data: { id: parseInt(id), address: newAddress, recipient_name: newRecipientName, recipient_phone: newRecipientPhone },
      });
    });
  });
});

app.delete("/api/delivery/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM deliveries WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Gagal cek delivery", error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Delivery tidak ditemukan" });
    }

    db.query("DELETE FROM deliveries WHERE id = ?", [id], (err2) => {
      if (err2) {
        return res.status(500).json({ success: false, message: "Gagal menghapus delivery", error: err2.message });
      }
      res.json({
        success: true,
        message: `Delivery dengan id ${id} berhasil dihapus`,
      });
    });
  });
});

app.get("/api/track/:id", (req, res) => {
  const { id } = req.params;

  const sql = "SELECT id, order_id, courier_id, status, address, recipient_name, updated_at FROM deliveries WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Gagal mengambil data tracking", error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Data tracking tidak ditemukan" });
    }

    const delivery = results[0];
    const statusInfo = {
      pending: "Pesanan sedang menunggu kurir",
      assigned: "Kurir sudah ditugaskan",
      picked_up: "Pesanan sudah diambil kurir",
      on_the_way: "Pesanan sedang dalam perjalanan",
      delivered: "Pesanan sudah sampai tujuan",
      failed: "Pengiriman gagal",
    };

    res.json({
      success: true,
      message: "Data tracking delivery",
      data: {
        ...delivery,
        status_description: statusInfo[delivery.status] || "Status tidak diketahui",
      },
    });
  });
});

app.get("/api/delivery/courier/:id", (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM deliveries WHERE courier_id = ? ORDER BY id DESC";
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Gagal mengambil info kurir", error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: `Tidak ada delivery untuk courier_id ${id}` });
    }
    res.json({
      success: true,
      message: `Info delivery untuk courier_id ${id}`,
      courier_id: parseInt(id),
      total_delivery: results.length,
      data: results,
    });
  });
});

app.put("/api/delivery/complete/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM deliveries WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Gagal cek delivery", error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Delivery tidak ditemukan" });
    }

    const sql = "UPDATE deliveries SET status = 'delivered' WHERE id = ?";
    db.query(sql, [id], (err2) => {
      if (err2) {
        return res.status(500).json({ success: false, message: "Gagal menyelesaikan delivery", error: err2.message });
      }
      res.json({
        success: true,
        message: `Delivery ${id} berhasil diselesaikan`,
        data: { id: parseInt(id), status: "delivered" },
      });
    });
  });
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Delivery Service running on port ${PORT}`);
});