# 📘 TASK.md — Food Delivery Microservices

## 🎯 Tujuan

Dokumen ini menjadi acuan pembagian tugas tim dalam mengembangkan sistem **Food Delivery Microservices** hingga tahap **integrasi database & antar service** (tanpa Docker terlebih dahulu).

---

# 🧠 Aturan Umum (WAJIB DIIKUTI SEMUA)

## ✅ 1. Gunakan struktur sederhana

* Semua logic di `app.js`
* Tidak perlu folder tambahan

## ✅ 2. Gunakan Express + JSON

```js
app.use(express.json());
```

## ✅ 3. Gunakan port berikut

| Service    | Port |
| ---------- | ---- |
| Restaurant | 3001 |
| Order      | 3002 |
| Payment    | 3003 |
| Delivery   | 3004 |

---

## ✅ 4. Gunakan MySQL (database masing-masing)

* restaurant_db
* order_db
* payment_db
* delivery_db

---

## ⚠️ 5. Workflow pengerjaan (WAJIB URUT)

```text
1. Koneksi database
2. Endpoint CRUD jalan
3. Test dengan Postman
4. Baru integrasi antar service
```

---

# 👥 PEMBAGIAN TUGAS

---

# 🍽️ 1. RESTAURANT SERVICE

## 🎯 Tugas Utama:

Mengelola data restoran dan menu

## 📌 Endpoint yang HARUS dibuat:

| Function              | Method                         |
| --------------------- | ------------------------------ |
| Ambil semua restoran  | GET /api/restaurants           |
| Ambil detail restoran | GET /api/restaurants/:id       |
| Tambah restoran baru  | POST /api/restaurants          |
| Update data restoran  | PUT /api/restaurants           |
| Hapus restoran        | DELETE /api/restaurants/:id    |
| Ambil menu restoran   | GET /api/restaurants/:id/menus |
| Tambah menu           | POST /api/menus                |
| Update menu           | PUT /api/menus/:id             |
| Hapus menu            | DELETE /api/menus/:id          |

---

## 🗄️ Database Minimal

```sql
CREATE TABLE restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255)
);

CREATE TABLE menus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT,
  name VARCHAR(255),
  price INT
);
```

---

# 💳 2. PAYMENT SERVICE

## 🎯 Tugas Utama:

Mengelola transaksi pembayaran

## 📌 Endpoint yang HARUS dibuat:

| Function                    | Method                           |
| --------------------------- | -------------------------------- |
| Proses pembayaran           | POST /api/payments/process       |
| Ambil semua transaksi       | GET /api/payments                |
| Detail transaksi            | GET /api/payments/:id            |
| Transaksi berdasarkan order | GET /api/payments/order/:orderId |
| Update status pembayaran    | PUT /api/payments/:id/status     |
| Refund pembayaran           | POST /api/payments/:id/refund    |

---

## 🗄️ Database Minimal

```sql
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  amount INT,
  status VARCHAR(50)
);
```

---

# 🛒 3. ORDER SERVICE (CORE SERVICE)

## 🎯 Tugas Utama:

Mengelola order + integrasi antar service

## 📌 Endpoint yang HARUS dibuat:

| Function                   | Method                               |
| -------------------------- | ------------------------------------ |
| Ambil semua order          | GET /api/orders                      |
| Ambil detail order         | GET /api/orders/:id                  |
| Tambah order               | POST /api/orders                     |
| Update status order        | PUT /api/orders/:id                  |
| Hapus order                | DELETE /api/orders/:id               |
| Order berdasarkan customer | GET /api/orders/customer/:customerId |

---

## 🔗 INTERNAL FUNCTION (WAJIB ADA)

| Function            | Keterangan          |
| ------------------- | ------------------- |
| Validasi customer   | call API customer   |
| Validasi restaurant | call API restaurant |
| Hitung total        | function internal   |

---

## 🔗 INTEGRASI WAJIB

```js
GET http://localhost:3001/api/restaurants/:id
POST http://localhost:3003/api/payments/process
```

---

## 🗄️ Database Minimal

```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT,
  total INT,
  status VARCHAR(50)
);
```

---

# 🚚 4. DELIVERY SERVICE

## 🎯 Tugas Utama:

Mengelola pengiriman

## 📌 Endpoint yang HARUS dibuat:

| Function        | Method                         |
| --------------- | ------------------------------ |
| Buat delivery   | POST /api/delivery             |
| Semua delivery  | GET /api/delivery              |
| Detail delivery | GET /api/delivery/:id          |
| Assign kurir    | POST /api/delivery/assign      |
| Update status   | PUT /api/delivery/status       |
| Update detail   | PUT /api/delivery/:id          |
| Hapus delivery  | DELETE /api/delivery/:id       |
| Tracking        | GET /api/track/:id             |
| Info kurir      | GET /api/delivery/courier/:id  |
| Selesai         | PUT /api/delivery/complete/:id |

---

## 🗄️ Database Minimal

```sql
CREATE TABLE deliveries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  status VARCHAR(50)
);
```

---

# 🔗 TARGET INTEGRASI AKHIR

```text
POST /api/orders
   ↓
Validasi restaurant (restaurant-service)
   ↓
Hitung total
   ↓
Proses payment (payment-service)
   ↓
Simpan order & payment
   ↓
(optional) create delivery
```

---

# 🧪 TESTING WAJIB

Gunakan Postman:

## Test Order:

```http
POST http://localhost:3002/api/orders
```

```json
{
  "restaurantId": 1,
  "items": [
    { "price": 15000 },
    { "price": 12000 }
  ]
}
```

---

# ⚠️ RULES PENTING

* ❌ Jangan ubah endpoint tanpa diskusi
* ❌ Jangan ubah port
* ❌ Jangan langsung pakai Docker
* ✅ Test per service dulu
* ✅ Gunakan JSON

---

# 🧭 CHECKPOINT PROGRESS

| Step                    | Status |
| ----------------------- | ------ |
| Semua service jalan     | ⬜      |
| Semua DB connect        | ⬜      |
| CRUD endpoint jalan     | ⬜      |
| Integrasi antar service | ⬜      |
| Data masuk DB           | ⬜      |

---

# 🚀 PENUTUP

Jika semua anggota mengikuti TASK.md ini:

> ✅ Sistem akan terintegrasi dengan baik
> ✅ Debugging lebih mudah
> ✅ Siap masuk tahap Docker & presentasi

---