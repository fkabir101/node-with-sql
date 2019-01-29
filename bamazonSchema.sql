DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;

USE bamazon;
CREATE TABLE products(
  item_id INTEGER(5) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(50) NOT NULL,
  department_name VARCHAR(50) NOT NULL,
  price DECIMAL(8, 2) NOT NULL,
  stock_quantity VARCHAR(50) NOT NULL
);