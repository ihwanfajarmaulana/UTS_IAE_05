const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'order_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rahasia123',
    waitForConnections: true,
    connectionLimit: 10,
});

async function testConnection() {
    try {
        const conn = await pool.getConnection();
        console.log('✅ Berhasil terhubung ke MySQL lokal!');
        conn.release();
    } catch (err) {
        console.error('❌ Gagal terhubung ke MySQL:', err.message);
    }
}

testConnection();

module.exports = pool;