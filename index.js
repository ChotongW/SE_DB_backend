const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require("body-parser");
const fs = require('fs');

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: false
 }));

const db = mysql.createConnection({
    host:"csleasing.mysql.database.azure.com", 
    user:"cs", 
    password:"@sedb1234", 
    database:"carleasing", 
    port:3306, 
    ssl:{ca:fs.readFileSync("DigiCertGlobalRootCA.crt.pem")}});

app.get('/', (req, res) => {
    res.send("hello world");
});

app.get('/vehicles', (req, res) => { 
    db.query('SELECT * FROM vehicles', (err, result) =>{
        if (err) throw err;
        //console.log(rows);
        res.send((result));
        });
});

app.get('/vehicle/', (req, res) => { 
    let vehicle_id = req.query.vehicleId;
    /*
    if (vehicle_id == null){
        
    }
    */
    //console.log(vehicle_id);
    var sql = "SELECT * FROM vehicles WHERE vehicle_id = ?";
    db.query(sql, vehicle_id, function(err, result, fields) { 
    if (err) throw err;
    //console.log(rows);
    res.send((result));
    });
});

app.listen('5500', () => {
    console.log("Server is running on port 5500");
})