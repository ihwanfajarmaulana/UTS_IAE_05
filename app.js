const express = require("express");
const app = express();
const mysql = require("mysql2"); 

app.use(express.json());

const dbrestaurants = mysql.createConnection({
    host: "switchback.proxy.rlwy.net",
    user: "root",
    password: "HtviZdvDFpywZyNkKQqRaUNfpoQeEIgb",
    database: "railway",
    port: 50624
});