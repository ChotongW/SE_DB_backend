const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require("body-parser");
const fs = require('fs');
//const fileUpload = require('express-fileupload');
const multer = require('multer')
const BlobServiceClient = require('@azure/storage-blob');

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
  let simpleFIle = req.file
  console.log(simpleFIle.filename)
  
  var sql = 'UPDATE vehicles SET vehicle_img = ? where vehicle_id = ?';
        db.query(sql, [simpleFIle.filename, vehicle_id], (err, rows) => {
          if (!err) {
            //res.redirect('/');
            res.send('File uploaded successfully');
          } else {
            console.log(err);
            res.status(500).send(err)}})
});

// app.post('/vehicle/image', (req, res) => {
//     let vehicle_id = req.query.vehicleId;
//     let sampleFile;
//     let uploadPath;
  
//     if (!req.files || Object.keys(req.files).length === 0) {
//         console.log(req.files)
//       return res.status(400).send('No files were uploaded.');
//     }
//     // name of the input is sampleFile
//     sampleFile = req.files['file'];
//     console.log(sampleFile);
//     uploadPath = __dirname + '/upload/' + sampleFile.name;
  
//     //console.log(sampleFile);
  
//     // Use mv() to place file on the server
//     sampleFile.mv(uploadPath, function (err) {
//       if (err) return res.status(500).send(err);
        
//         var sql = 'UPDATE vehicles SET vehicle_img = ? where vehicle_id = ?';
//         db.query(sql, [sampleFile.name, vehicle_id], (err, rows) => {
//           if (!err) {
//             res.redirect('/');
//           } else {
//             console.log(err);
//             res.status(500).send(err);
//           }
//         });
//       });
//   });

app.listen('5500', () => {
    console.log("Server is running on port 5500");
})