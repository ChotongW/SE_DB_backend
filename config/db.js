const mysql = require('mysql');
const fs = require('fs');

const db = mysql.createConnection({
    host:"csleasing.mysql.database.azure.com", 
    user:"cs", 
    password:"@sedb1234", 
    database:"carleasing", 
    port:3306, 
    ssl:{ca:fs.readFileSync("DigiCertGlobalRootCA.crt.pem")}});


module.exports = db;