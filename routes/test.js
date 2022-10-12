const express = require("express");
router = express.Router();
const queryDB = require("../config/db");
const upload = require("../storage/multer");
const blob = require("../storage/blobCar");
const userMiddleware = require("../middleware/role");
const payment = require("../routes/payment");
const fs = require("fs");

router.get("/getAll", userMiddleware.isLoggedIn, (req, res) => {
  console.log(req.userData.id);
  queryDB(
    "SELECT * FROM vehicles",
    undefined,
    (err) => {
      //console.log(err);
      throw (err, res.send(err, 500));
    },
    (result) => {
      res.send(result);
    }
  );
});

router.post("/upload", upload.single("file"), async (req, res) => {
  let simpleFile = req.file;

  //upload to storage account
  try {
    var callback = await blob.blob_upload(simpleFile);
    //res.redirect('/');
    console.log(callback);
    res.send("File uploaded successfully");
    fs.unlink(simpleFile.path, (err) => {
      if (err) throw err;
      // if no error, file has been deleted successfully
      console.log("Local file deleted!");
    });
  } catch (error) {
    console.log(error);
    //res.status(500).send("Failure uploading");
  }
  //console.log(upload_res);
  //   fs.unlink(simpleFile.path, (err) => {
  //     if (err) throw err;
  //     // if no error, file has been deleted successfully
  //     console.log('File deleted!');
  // });
});

module.exports = router;
