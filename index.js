const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require("body-parser");
const fs = require('fs');
//const fileUpload = require('express-fileupload');
const multer = require('multer')
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config()

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: false
 }));
//app.use(fileUpload());

const db = mysql.createConnection({
    host:"csleasing.mysql.database.azure.com", 
    user:"cs", 
    password:"@sedb1234", 
    database:"carleasing", 
    port:3306, 
    ssl:{ca:fs.readFileSync("DigiCertGlobalRootCA.crt.pem")}});

// db.connect(function (err) {
//     if (err) {
//         return console.error('error: ' + err.message);
//     }
//     console.log('Connected to the MySQL server.');
// })

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, './upload')
    },
    filename: (req, file, callback) => {
        callback(null, 'file-' + Date.now() + '.' +
        file.originalname.split('.')[file.originalname.split('.').length-1])}
})
  
const upload = multer({ storage: storage })

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw Error("Azure Storage Connection string not found");
}
//console.log(AZURE_STORAGE_CONNECTION_STRING)

// Create the BlobServiceClient object which will be used to create a container client
const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);

// Create a unique name for the container
const containerName = "carimg"

console.log("\nconnecting container...");
console.log("\t", containerName);

// Get a reference to a container
const containerClient = blobServiceClient.getContainerClient(containerName);

console.log(`Container was created successfully.\n\tURL: ${containerClient.url}`);

app.get('/', (req, res) => {
    res.send("hello world");
});

app.get('/vehicles', (req, res) => { 
    db.query('SELECT * FROM vehicles', (err, result) =>{
        if (err) throw err ,res.status(500).send(err, 500);
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
    db.query(sql, vehicle_id, (err, result, fields) => { 
    if (err) throw err ,res.status(500).send(err);
    //console.log(rows);
    res.send((result));
    });

    /*
    app.get("/vehicle/", cors(), function(req, res) {
        let vehicle_id = req.query.vehicleId;
        let name = req.query.name;
      
        var sql = "SELECT * FROM vehicles WHERE vehicle_id = ? AND name >= ?";
        db.query(sql, [ vehicle_id, name ], function(err, rows, fields) {
        if (err) throw err;
        //console.log(rows);
        res.send((result));
        });
      });
    */
});

app.post('/vehicle/image', upload.single('file'), (req, res) => {
  let vehicle_id = req.query.vehicleId;
  let simpleFile = req.file

  // Create a unique name for the blob
  const blobName = simpleFile.filename;

  // Get a block blob client
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Display blob name and url
  console.log(`\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${blockBlobClient.url}`);

  // Upload data to the blob
  blockBlobClient.uploadFile(simpleFile.path, simpleFile.filename);
  
  console.log(`Blob was uploaded successfully`);

  //mysql store url
  var sql = 'UPDATE vehicles SET vehicle_img = ? where vehicle_id = ?';
        db.query(sql, [blockBlobClient.url, vehicle_id], (err, rows) => {
          if (!err) {
            //res.redirect('/');
            res.send('File uploaded successfully');
          } else {
            console.log(err);
            res.status(500).send(err)}})
});

app.post('/upload', upload.single('file'), (req, res) => {
    let simpleFile = req.file
    // Create a unique name for the blob
    const blobName = simpleFile.filename;

    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
    // Display blob name and url
    console.log(`\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${blockBlobClient.url}`);
  
    // Upload data to the blob
    //console.log(simpleFile)
    blockBlobClient.uploadFile(simpleFile.path, simpleFile.filename.length);
    console.log(`Blob was uploaded successfully`);
    res.send('File uploaded successfully');

  //   fs.unlink(simpleFile.path, (err) => {
  //     if (err) throw err;
  //     // if no error, file has been deleted successfully
  //     console.log('File deleted!');
  // });
});

app.listen('5500', () => {
    console.log("Server is running on port 5500");
})