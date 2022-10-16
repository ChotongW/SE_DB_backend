const express = require("express");
router = express.Router();
const queryDB = require("../config/db");
const upload = require("../storage/multer");
const blob = require("../storage/blobCar");
const redis = require("../config/redis");
const fs = require("fs");

router.get("/getAll", async (req, res) => {
  //console.log(req.userData.id);
  var sql = "SELECT * FROM vehicles WHERE availability != ?";
  try {
    var result = await queryDB(sql, 0);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.send(err, 500);
    return;
  }
  //console.log("HI THERE!");
  //res.send(result);
  // queryDB(
  //   "SELECT * FROM vehicles",
  //   undefined,
  //   (err) => {
  //     //console.log(err);
  //     throw (err, res.send(err, 500));
  //   },
  //   (result) => {
  //     res.send(result);
  //   }
  // );
});

router.get("/redis", async (req, res) => {
  await redis.connect();

  let vehicle_id = await redis.get("vehicle_id");
  let start_date = await redis.get("start_date");
  let end_date = await redis.get("end_date");

  result = {
    carId: vehicle_id,
    bookDate: start_date,
    returnDate: end_date,
  };
  console.log(result);
  res.send(result);
  await redis.disconnect();
});

router.post("/redis/add", async (req, res) => {
  let vehicle_id = req.body.carId;
  let start_date = req.body.bookDate;
  let end_date = req.body.returnDate;
  await redis.connect();

  await redis.set("vehicle_id", vehicle_id);
  await redis.set("start_date", start_date);
  await redis.set("end_date", end_date);

  res.send({ message: "post already" });
  await redis.disconnect();
});

router.get("/cost", async (req, res) => {
  let in_id = req.body.insuranceId;

  if (in_id.length == 0) {
    in_id = "null";
  }
  console.log(in_id);
  var sql = "SELECT cost from insurance where in_id = ?";
  try {
    var result = await queryDB(sql, in_id);
    if (result.length == 0) {
      var insu_cost = 0;
    } else {
      insu_cost = result[0].cost;
    }
    res.send({ message: insu_cost });
  } catch (err) {
    console.log(err);
    res.send({ message: err });
    return;
  }
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
