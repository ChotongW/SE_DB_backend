const express = require('express');
router = express.Router()
const db = require('../database/db');
const upload = require('../storage/multer');
const blob = require('../storage/blob');

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
    blob.blob_upload(simpleFile, (err, res) => {
      if (!err) {
        //res.redirect('/');
        console.log(res);
      }else{
        console.log(err);
        res.status(500).send();
      }})   
    //console.log(upload_res);
    
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

router.post('/', upload.single('file'), (req, res) => {
  let carName = req.body.carName;
  let vehicle_id = req.body.carId;
  let description = req.body.description;
  let review = req.body.review;
  let price = req.body.price;
  let simpleFile = req.file
  //let booking_status = req.booking_status;
  if (carName == "" || vehicle_id == "" || price == "") {
      res.send({
          status: 'incompleted',
          message: 'You have some fields unfilled.',
      });
  }
  //upload to storage account
  let upload_res = blob.blob_upload(simpleFile)
  console.log(upload_res);
  res.send('File uploaded successfully');

//   fs.unlink(simpleFile.path, (err) => {
//     if (err) throw err;
//     // if no error, file has been deleted successfully
//     console.log('File deleted!');
// });
});

module.exports = router;