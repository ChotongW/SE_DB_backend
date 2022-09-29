const express = require('express');
const app = express();
const index = require('./routes/route');
const db = require('./database/db');
const blobServiceClient = require('./storage/blob');

const cors = require('cors');
const bodyParser = require("body-parser");
const fs = require('fs');
//const fileUpload = require('express-fileupload');
//const multer = require('multer')
//const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config()

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: false
 }));

app.use('/', index);
//app.use('/', upload);

db.connect(function (err) {
    if (err) {
        return console.error('error: ' + err.message);
    }
    console.log('Connected to the MySQL server.');
})

const containerName = "carimg"

console.log("\nconnecting container...");
console.log("\t", containerName);

// Get a reference to a container
const containerClient = blobServiceClient.getContainerClient(containerName);

console.log(`Container was created successfully.\n\tURL: ${containerClient.url}`);


app.listen('5500', () => {
    console.log("Server is running on port 5500");
})