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
});

router.get("/bill", async (req, res) => {
  let id_no = req.body.id;
  let book_id = req.body.book_id;
  console.log(id_no);

  var sql = "SELECT status FROM booking where book_id = ?";
  try {
    var result = await queryDB(sql, book_id);
    // if success does below
    //console.log(result);
    let status = result[0].status;
    //let book_id = result[0].book_id;
    if (status === "finished") {
      userProf["daylefts"] = null;
    }
  } catch (err) {
    console.log(err);
    res.send(500, { message: err });
  }

  var sql = "SELECT end_date FROM booking where id_no = ?";
  try {
    var result = await queryDB(sql, id_no);
    console.log(result.length);
    console.log(result);
    if (result.length === 0) {
      userProf["daylefts"] = null;
      res.status(200).send(userProf);
    } else if (result.length) {
    } else {
      var date = parseInt(
        JSON.stringify(result[0].end_date).split("-")[2].slice(0, 2),
        10
      );
      var summary = date - day;
      userProf["daylefts"] = summary;
      //console.log(result[0].daylefts);
      res.status(200).send(userProf);
    }
  } catch (err) {
    console.log(err);
    res.send(500, { message: err });
    return;
  }
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
