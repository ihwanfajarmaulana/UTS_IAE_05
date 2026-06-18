# Food Delivery System - Microservices dengan GraphQL

Aplikasi ini merupakan sistem pemesanan makanan berbasis *microservices* yang menggunakan antarmuka GraphQL.Project ini memisahkan fungsionalitas bisnis menjadi layanan-layanan independen yang terisolasi, didukung oleh *database* masing-masing, dan diorkestrasi menggunakan Docker.

Aplikasi ini juga dilengkapi dengan *dashboard* website sebagai *client*/UI untuk memudahkan pengguna melihat dan mengelola data secara langsung.

## 🏗️ Arsitektur & Alur Kerja

Aplikasi ini dibangun menggunakan arsitektur *Microservices* murni tanpa API Gateway, dengan karakteristik berikut:
* **Pemisahan Service:** Terdapat empat *service* utama yaitu Restaurant, Order, Payment, dan Delivery[cite: 5]. [cite_start]Setiap *service* berjalan sebagai entitas mandiri dengan logika bisnisnya sendiri.
* **Isolasi Database (Database-per-Service):** Setiap *service* memiliki skema atau basis datanya masing-masing (misalnya `order.sql`, `payment.sql`), Hal ini memastikan bahwa jika satu *service* mengalami kendala *database*, *service* lain tidak akan terdampak.
* **Komunikasi GraphQL:** Menggantikan REST API tradisional, setiap layanan mendefinisikan skemanya sendiri (`typeDefs`) dan logika pengambilan datanya (`resolvers`) menggunakan GraphQL.
* **Containerization:** Seluruh *service* dan *database* diisolasi menggunakan Docker dan diatur melalui `docker-compose.yml` agar dapat berkomunikasi dengan aman di jalurnya sendiri.

Secara sederhana, *workflow* aplikasi berjalan sebagai berikut:
**User / Browser → Client UI Dashboard → Docker Port Mapping → GraphQL Endpoint → Microservice Container → Resolver → MySQL Database Container → Response ke Client UI** 

---

## 📦 Daftar Service, Query, dan Mutation

Selain melalui *dashboard* website, seluruh proses pada setiap *service* dapat diuji secara langsung melalui Apollo Sandbox dengan mengakses *endpoint* GraphQL masing-masing *service*.

### 1. Restaurant Service
Mengelola data restoran dan menu makanan.

**Queries:**
* `restaurants`: Ambil semua restoran.
* `restaurant(id: ID!)`: Ambil restoran berdasarkan ID.
* `menus`: Ambil semua menu.
* `menu(id: ID!)`: Ambil menu berdasarkan ID.
* `menusByRestaurant(restaurantId: ID!)`: Ambil menu berdasarkan ID restoran.

**Mutations:**
* `addRestaurant(name: String!)`: Tambah restoran baru.
* `updateRestaurant(id: ID!, name: String!)`: Update data restoran.
* `deleteRestaurant(id: ID!)`: Hapus restoran.
* `addMenu(restaurantId: ID!, name: String!, price: Int!)`: Tambah menu ke restoran.
* `updateMenu(id: ID!, name: String, price: Int)`: Update data menu.
* `deleteMenu(id: ID!)`: Hapus menu.

### 2. Order Service
Menangani pembuatan pesanan berdasarkan restoran.

**Queries:**
* `orders`: Ambil semua order.
* `order(id: ID!)`: Ambil order berdasarkan ID.
* `ordersByRestaurant(restaurantId: ID!)`: Ambil order berdasarkan restoran.

**Mutations:**
* `createOrder(restaurantId: ID!, total: Float!, status: String)`: Buat order baru.
* `updateOrderStatus(id: ID!, status: String!)`: Update status order.
* `deleteOrder(id: ID!)`: Hapus order.

### 3. Payment Service
Memproses transaksi pembayaran dari order yang dibuat.

**Queries:**
* `payments`: Ambil semua pembayaran.
* `payment(id: ID!)`: Ambil pembayaran by ID.
* `paymentsByOrder(orderId: String!)`: Ambil pembayaran by Order ID.

**Mutations:**
* `processPayment(orderId: String!, amount: Float!)`: Proses pembayaran baru.
* `updatePaymentStatus(id: ID!, status: String!)`: Update status pembayaran.
* `refundPayment(id: ID!)`: Refund pembayaran.

### 4. Delivery Service
Mengelola logistik dan pengiriman pesanan.

**Queries:**
* `deliveries`: Ambil semua *delivery*.
* `delivery(id: ID!)`: Ambil *delivery* berdasarkan ID.
* `trackDelivery(id: ID!)`: Lacak status *delivery* berdasarkan ID.
* `deliveriesByCourier(courierId: ID!)`: Ambil *delivery* berdasarkan ID Kurir.

**Mutations:**
* `createDelivery(...)`: Buat data *delivery* baru.
* `assignCourier(deliveryId: ID!, courierId: ID!)`: Tetapkan kurir pengantar.
* `updateDeliveryStatus(deliveryId: ID!, status: String!)`: Update status pengiriman.
* `updateDelivery(...)`: Update detail alamat dan penerima.
* `completeDelivery(id: ID!)`: Selesaikan proses pengiriman.
* `deleteDelivery(id: ID!)`: Hapus data *delivery*.

---

## Cara Instalasi dan Menjalankan Project

Bagian ini menjelaskan langkah-langkah untuk menjalankan project Food Delivery System secara lokal. Project ini menggunakan Docker Compose untuk menjalankan backend service dan database, sedangkan client/UI dijalankan secara terpisah melalui file `view/index.html` menggunakan Live Server.

### 1. Persiapan

Sebelum menjalankan project, pastikan beberapa aplikasi berikut sudah terpasang:

* Docker Desktop
* Visual Studio Code
* Extension Live Server di Visual Studio Code
* Git

### 2. Clone Repository

Clone repository project ke komputer lokal:

```bash
git clone <url-repository>
cd UTS_IAE_05
```

Jika project sudah ada di komputer, cukup buka folder project tersebut di Visual Studio Code.

### 3. Buka Folder Project di Visual Studio Code

Pastikan folder yang dibuka adalah root folder project, yaitu folder yang berisi file:

```txt
docker-compose.yml
README.md
view/
restaurant-service/
order-service/
payment-service/
delivery-service/
```

### 4. Jalankan Backend Service dan Database

Buka terminal pada root folder project, lalu jalankan perintah berikut:

```bash
docker compose up --build
```

Perintah tersebut digunakan untuk membangun dan menjalankan seluruh container yang dibutuhkan, yaitu:

* Restaurant Service
* Order Service
* Payment Service
* Delivery Service
* Database MySQL untuk masing-masing service

Jika container berhasil berjalan, maka endpoint GraphQL dapat diakses melalui port masing-masing service.

### 5. Akses Endpoint GraphQL

Setelah Docker Compose berjalan, API GraphQL dapat diuji melalui Apollo Sandbox atau browser dengan endpoint berikut:

| Service            | Endpoint                        |
| ------------------ | ------------------------------- |
| Restaurant Service | `http://localhost:3315/graphql` |
| Order Service      | `http://localhost:3316/graphql` |
| Payment Service    | `http://localhost:3317/graphql` |
| Delivery Service   | `http://localhost:3318/graphql` |

Endpoint tersebut digunakan untuk melakukan pengujian query dan mutation pada masing-masing service.

### 6. Jalankan Client/UI Menggunakan Live Server

Client/UI aplikasi berada pada file:

```txt
view/index.html
```

Untuk menjalankannya:

1. Buka file `view/index.html` di Visual Studio Code.
2. Klik kanan pada file tersebut.
3. Pilih **Open with Live Server**.
4. Browser akan membuka dashboard aplikasi, misalnya:

```txt
http://127.0.0.1:5500/view/index.html
```

Melalui dashboard tersebut, user dapat mengelola data restaurant, menu, order, payment, dan delivery secara langsung melalui tampilan UI.

### 7. Menghentikan Container

Jika ingin menghentikan seluruh container yang sedang berjalan, gunakan perintah berikut:

```bash
docker compose down
```

Perintah tersebut akan menghentikan container service dan database yang berjalan melalui Docker Compose.

### 8. Ringkasan Alur Menjalankan Project

```txt
1. Buka project di Visual Studio Code
2. Jalankan Docker Desktop
3. Buka terminal pada root project
4. Jalankan docker compose up --build
5. Buka view/index.html
6. Klik kanan lalu pilih Open with Live Server
7. Uji GraphQL melalui Apollo Sandbox
```
