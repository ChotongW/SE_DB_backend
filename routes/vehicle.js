const express = require('express');
const bodyParser = require("body-parser");
router = express.Router()
const db = require('../database/db');
const upload = require('../storage/multer');
const blob = require('../storage/blob');

router.use(express.json());
router.use(bodyParser.urlencoded({
    extended: true
 }));

router.get('/', (req, res) => {
  db.query('SELECT * FROM vehicles', (err, result) =>{
    if (err) throw err ,res.status(500).send(err, 500);
    //console.log(rows);
    res.send((result));
    });
});

router.get('/id', (req, res) => { 
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

    // router.get("/vehicle/", cors(), function(req, res) {
    //     let vehicle_id = req.query.vehicleId;
    //     let name = req.query.name;
      
    //     var sql = "SELECT * FROM vehicles WHERE vehicle_id = ? AND name >= ?";
    //     db.query(sql, [ vehicle_id, name ], function(err, rows, fields) {
    //     if (err) throw err;
    //     //console.log(rows);
    //     res.send((result));
    //     });
    //   });
});

router.put('/image', upload.single('file'), (req, res) => {
    let vehicle_id = req.query.vehicleId;
    let simpleFile = req.file
  
    //upload to storage account
    try {
      var callback = blob.blob_upload(simpleFile)
      console.log(callback);
      //res.send('File uploaded successfully');
    } catch (error) {
      console.log(error);
      res.status(500).send("Failure uploading");
    }
    //console.log(upload_res);
    
    //mysql store url
    var sql = 'UPDATE vehicles SET vehicle_img = ? where vehicle_id = ?';
          db.query(sql, [callback, vehicle_id], (err, result) => {
            if (!err) {
              //res.redirect('/');
              res.redirect(201, '/');
            } else {
              console.log(err);
              res.status(500).send(err)}})
  });

router.post('/', upload.single('file'), (req, res) => {
  let vehicle_id = req.body.carId;
  let carModel = req.body.carName;
  let description = req.body.description;
  let review = req.body.review;
  let price = parseInt(req.body.price, 10);
  let simpleFile = req.file
  //let booking_status = req.booking_status;
  if (carModel == null || vehicle_id == null || price == null) {
      res.send({
          status: 'incompleted',
          message: 'You have some fields unfilled.',
      });
  }
  console.log(price);
  let brand = carModel.split(' ')[0];
  let carName = carModel.split(' ')[1];
  let year = carModel.split(' ')[2];

//   //upload to storage account
//   try {
//     let callback = blob.blob_upload(simpleFile)
//     console.log(callback);
//     //res.send('File uploaded successfully');
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Failure uploading");
//   }
//   var sql = "INSERT INTO vehicles (vehicle_id, name,  brand, year, cost, availability, type_id, vehicle_img) VALUES(?, ?, ?, ?, ?, ?, ?, ?)";
//   db.query(sql, [vehicle_id, carName, brand, year, price, 1, 1, callback], (err, result) => {
//     if (!err) {
//       res.send(201,'Created vehicle already');
//       //res.redirect(201, '/');
//     } else {
//       console.log(err);
//       res.send(500, err)}})
// //   fs.unlink(simpleFile.path, (err) => {
// //     if (err) throw err;
// //     // if no error, file has been deleted successfully
// //     console.log('File deleted!');
// // });
});

module.exports = router;