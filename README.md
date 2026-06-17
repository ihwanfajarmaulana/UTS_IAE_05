# Food Delivery System - Microservices dengan GraphQL

[cite_start]Aplikasi ini merupakan sistem pemesanan makanan berbasis *microservices* yang menggunakan antarmuka GraphQL[cite: 1]. [cite_start]Project ini memisahkan fungsionalitas bisnis menjadi layanan-layanan independen yang terisolasi, didukung oleh *database* masing-masing, dan diorkestrasi menggunakan Docker[cite: 1, 4, 11].

[cite_start]Aplikasi ini juga dilengkapi dengan *dashboard* website sebagai *client*/UI untuk memudahkan pengguna melihat dan mengelola data secara langsung[cite: 1].

## 🏗️ Arsitektur & Alur Kerja

Aplikasi ini dibangun menggunakan arsitektur *Microservices* murni tanpa API Gateway, dengan karakteristik berikut:
* [cite_start]**Pemisahan Service:** Terdapat empat *service* utama yaitu Restaurant, Order, Payment, dan Delivery[cite: 5]. [cite_start]Setiap *service* berjalan sebagai entitas mandiri dengan logika bisnisnya sendiri[cite: 6].
* [cite_start]**Isolasi Database (Database-per-Service):** Setiap *service* memiliki skema atau basis datanya masing-masing (misalnya `order.sql`, `payment.sql`)[cite: 7, 8]. [cite_start]Hal ini memastikan bahwa jika satu *service* mengalami kendala *database*, *service* lain tidak akan terdampak[cite: 8].
* [cite_start]**Komunikasi GraphQL:** Menggantikan REST API tradisional, setiap layanan mendefinisikan skemanya sendiri (`typeDefs`) dan logika pengambilan datanya (`resolvers`) menggunakan GraphQL[cite: 9, 10].
* [cite_start]**Containerization:** Seluruh *service* dan *database* diisolasi menggunakan Docker dan diatur melalui `docker-compose.yml` agar dapat berkomunikasi dengan aman di jalurnya sendiri[cite: 11, 12].

Secara sederhana, *workflow* aplikasi berjalan sebagai berikut:
[cite_start]**User / Browser → Client UI Dashboard → Docker Port Mapping → GraphQL Endpoint → Microservice Container → Resolver → MySQL Database Container → Response ke Client UI** [cite: 24]

---

## 📦 Daftar Service, Query, dan Mutation

[cite_start]Selain melalui *dashboard* website, seluruh proses pada setiap *service* dapat diuji secara langsung melalui Apollo Sandbox dengan mengakses *endpoint* GraphQL masing-masing *service*[cite: 22].

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

## 🧪 Tutorial Testing GraphQL (Apollo Sandbox)

Pastikan seluruh *container* sudah berjalan menggunakan `docker-compose up -d`. Anda dapat membuka Apollo Sandbox di *browser* dengan memasukkan URL *localhost* sesuai *port* masing-masing *service*.

Berikut adalah panduan *end-to-end* menguji alur aplikasi:
