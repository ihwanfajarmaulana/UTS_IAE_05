CREATE DATABASE IF NOT EXISTS restaurant_db;
USE restaurant_db;

CREATE TABLE IF NOT EXISTS restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  price INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

INSERT INTO restaurants (name) VALUES
  ('Warung Makan Sederhana'),
  ('Resto Padang Minang'),
  ('Soto Mbok Giyem');

INSERT INTO menus (restaurant_id, name, price) VALUES
  (1, 'Nasi Goreng', 15000),
  (1, 'Mie Goreng', 12000),
  (2, 'Nasi Padang Ayam', 25000),
  (2, 'Rendang Daging', 35000),
  (3, 'Soto Ayam', 15000),
  (3, 'Soto Babat', 25000);