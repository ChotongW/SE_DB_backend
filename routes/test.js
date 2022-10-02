const express = require('express');
router = express.Router()
const db = require('../config/db');
const upload = require('../storage/multer');
const blob = require('../storage/blob');

router.put('/', upload.single('file'), (req, res) => {
    let simpleFile = req.file

    //upload to storage account
    try {
      var callback = blob.blob_upload(simpleFile)
      //res.redirect('/');
      console.log(callback);
      res.send('File uploaded successfully');
    } catch (error) {
      console.log(error);
      res.status(500).send("Failure uploading");
    }
    //console.log(upload_res);
  //   fs.unlink(simpleFile.path, (err) => {
  //     if (err) throw err;
  //     // if no error, file has been deleted successfully
  //     console.log('File deleted!');
  // });
});

module.exports = router;