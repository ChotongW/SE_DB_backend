const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: false
 }));

 /*
const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "",
    database: "carsystem"
})
*/

app.get('/', (req, res) => {
    res.send("hello world");
});

app.listen('5500', () => {
    console.log("Server is running on port 5500");
})