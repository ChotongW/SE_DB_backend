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

    /*
    router.get("/vehicle/", cors(), function(req, res) {
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

router.put('/image', upload.single('file'), (req, res) => {
    let vehicle_id = req.query.vehicleId;
    let simpleFile = req.file
  
    // Create a unique name for the blob
    const blobName = simpleFile.filename;
  
    // Get a block blob client
    const blockBlobClient = blob.containerClient.getBlockBlobClient(blobName);
  
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

// router.post('/upload', upload.single('file'), (req, res) => {
//   let simpleFile = req.file
//   // Create a unique name for the blob
//   const blobName = simpleFile.filename;

//   // Get a block blob client
//   const blockBlobClient = containerClient.getBlockBlobClient(blobName);

//   // Display blob name and url
//   console.log(`\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${blockBlobClient.url}`);

//   // Upload data to the blob
//   //console.log(simpleFile)
//   blockBlobClient.uploadFile(simpleFile.path, simpleFile.filename.length);
//   console.log(`Blob was uploaded successfully`);
//   res.send('File uploaded successfully');

// //   fs.unlink(simpleFile.path, (err) => {
// //     if (err) throw err;
// //     // if no error, file has been deleted successfully
// //     console.log('File deleted!');
// // });
// });

module.exports = router;