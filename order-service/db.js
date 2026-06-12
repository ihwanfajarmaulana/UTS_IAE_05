const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'rahasia123',
    database: process.env.DB_DATABASE || 'order_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

async function testConnection() {
    try {
        const conn = await pool.getConnection();
        console.log('✅ Berhasil konek ke database MySQL (Order DB)!');
        conn.release();
    } catch (err) {
        console.error('❌ Gagal koneksi ke database Order DB:', err.message);
        process.exit(1);
    }
}

testConnection();

module.exports = pool;
