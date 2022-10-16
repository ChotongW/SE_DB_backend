const express = require("express");
router = express.Router();
const queryDB = require("../config/db");
const upload = require("../storage/multer");
const blob = require("../storage/blobCar");
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

router.get("/mongo", async (req, res) => {
  res.send("hi");
});

router.get("/cost", async (req, res) => {
  let in_id = req.body.insuranceId;
  let vehicle_id = req.body.carId;
  let start_date = req.body.bookDate;
  let end_date = req.body.returnDate;

  var sql = "SELECT cost from insurance where in_id = ?";
  try {
    var result = await queryDB(sql, in_id);
    if (result.length == 0) {
      var insu_cost = 0;
    } else {
      insu_cost = result[0].cost;
    }
    //res.send({ message: insu_cost });
  } catch (err) {
    console.log(err);
    //res.send({ message: err });
    return;
  }

  var sql = "SELECT cost from vehicles where vehicle_id = ?";
  try {
    var result2 = await queryDB(sql, vehicle_id);
    var vehicle_cost = result2[0].cost;
    //res.send({ message: insu_cost });
  } catch (err) {
    console.log(err);
    //res.send({ message: err });
    return;
  }

  var diffDays =
    parseInt(end_date.split("-")[2], 10) -
    parseInt(start_date.split("-")[2], 10);
  var amount_balance = diffDays * vehicle_cost + insu_cost;
  var tax_amount = amount_balance * 0.07;
  var total_amount = amount_balance + tax_amount;
  res.send({
    amount_balance: amount_balance,
    tax_amount: tax_amount,
    total_amount: total_amount,
  });
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
