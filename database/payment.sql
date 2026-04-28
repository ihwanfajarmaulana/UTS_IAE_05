CREATE DATABASE IF NOT EXISTS payment_db;

USE payment_db;

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    amount INT,
    status VARCHAR(50)
);