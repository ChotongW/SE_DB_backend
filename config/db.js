const mysql = require('mysql');
const fs = require('fs');
const dotenv = require("dotenv")
dotenv.config()

const db = mysql.createConnection({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASS, 
    database: process.env.database, 
    port:3306, 
    ssl:{ca:fs.readFileSync("DigiCertGlobalRootCA.crt.pem")}});


module.exports = db;