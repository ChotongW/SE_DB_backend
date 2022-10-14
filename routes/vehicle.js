const express = require("express");
const bodyParser = require("body-parser");
const queryDB = require("../config/db");
const upload = require("../storage/multer");
const blob = require("../storage/blobCar");
const userMiddleware = require("../middleware/role");
const fs = require("fs");

router = express.Router();
router.use(express.json());
router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

router.get("/", async (req, res) => {
  var sql = "SELECT * FROM vehicles WHERE availability != 0";
  try {
    var result = await queryDB(sql, undefined);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.send(err, 500);
    return;
  }
});

router.get("/:id", async (req, res) => {
  //รับเป็น query params นะ
  let vehicle_id = req.query.vehicleId;
  //console.log(vehicle_id);
  var sql = "SELECT * FROM vehicles WHERE vehicle_id = ?";
  try {
    var result = await queryDB(sql, vehicle_id);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.send(err, 500);
    return;
  }
});

const doEdit = async (req, res, img_path) => {
  let vehicle_id = req.body.carId;
  let carModel = req.body.carName;
  let price = parseInt(req.body.price, 10);
  let vehicle_type = parseInt(req.body.typeId, 10);
  let description = req.body.description;
  let review = req.body.review;

  //console.log(simpleFile);
  let brand = carModel.split(" ")[0];
  let carName = carModel.split(" ")[1];
  let year = carModel.split(" ")[2];

  //mysql store url
  var sql =
    "UPDATE vehicles SET vehicle_img = ?, name = ?, brand = ?, year = ?, cost = ?, type_id = ?, description  = ?, review = ? where vehicle_id = ?";
  try {
    var result = await queryDB(sql, [
      img_path,
      carName,
      brand,
      year,
      price,
      vehicle_type,
      description,
      review,
      vehicle_id,
    ]);
    res.send({ message: "update img already" });
  } catch (err) {
    console.log(err);
    res.send(err, 500);
    return;
  }
};

router.put(
  "/edit",
  userMiddleware.isAdmin,
  upload.single("file"),
  async (req, res) => {
    let vehicle_id = req.body.carId;
    let carModel = req.body.carName;
    let price = parseInt(req.body.price, 10);
    let vehicle_type = parseInt(req.body.typeId, 10);
    let simpleFile = req.file;

    if (
      carModel == null ||
      vehicle_id == null ||
      price == null ||
      vehicle_type == null
    ) {
      res.send(
        {
          status: "incompleted",
          message: "You have some fields unfilled.",
        },
        400
      );
      return 0;
    }

    if (simpleFile == null) {
      var sql = "SELECT vehicle_img from vehicles where vehicle_id = ?";
      try {
        var result = await queryDB(sql, vehicle_id);
        //console.log(result[0].vehicle_img);
        doEdit(req, res, result[0].vehicle_img);
      } catch (err) {
        console.log(err);
        res.send(err, 500);
        return;
      }
    } else {
      //upload to storage account
      try {
        var callback = await blob.blob_upload(simpleFile);
        //console.log(callback);
        //res.send('File uploaded successfully');
        console.log("File uploaded successfully");
      } catch (error) {
        console.log(error);
        res.status(500).send("Failure uploading");
        return;
      }
      fs.unlink(simpleFile.path, (err) => {
        if (err) throw err;
        // if no error, file has been deleted successfully
        console.log("Local file deleted!");
      });
      doEdit(req, res, callback);
      //console.log(upload_res);
    }
  }
);

router.post(
  "/",
  userMiddleware.isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    //console.log(req.body);
    let vehicle_id = req.body.carId;
    let carModel = req.body.carName;
    let description = req.body.description;
    let review = req.body.review;
    let price = parseInt(req.body.price, 10);
    let vehicle_type = parseInt(req.body.typeId, 10);
    let simpleFile = req.file;
    //let booking_status = req.booking_status;
    if (
      carModel == null ||
      vehicle_id == null ||
      price == null ||
      vehicle_type == null ||
      simpleFile == null
    ) {
      res.send(
        {
          status: "incompleted",
          message: "You have some fields unfilled.",
        },
        400
      );
      return 0;
    }
    //console.log(simpleFile);
    let brand = carModel.split(" ")[0];
    let carName = carModel.split(" ")[1];
    let year = carModel.split(" ")[2];
    //res.send(200)
    //upload to storage account
    try {
      var callback = await blob.blob_upload(simpleFile);
      console.log(callback);
      //res.send('File uploaded successfully');
      console.log("File uploaded successfully");
    } catch (error) {
      console.log(error);
      res.status(500).send("Failure uploading");
      return;
    }
    fs.unlink(simpleFile.path, (err) => {
      if (err) throw err;
      // if no error, file has been deleted successfully
      console.log("Local file deleted!");
    });

    var sql =
      "INSERT INTO vehicles (vehicle_id, name,  brand, year, cost, availability, type_id, vehicle_img, description, review) \
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    try {
      var result = await queryDB(sql, [
        vehicle_id,
        carName,
        brand,
        year,
        price,
        1,
        vehicle_type,
        callback,
        description,
        review,
      ]);
      res.send(201, { response: "Created vehicle already" });
    } catch (err) {
      console.log(err);
      res.send(500, { response: err });
      return;
    }
  }
);

router.delete("/delete", userMiddleware.isAdmin, async (req, res) => {
  let vehicle_id = req.body.carId;
  if (vehicle_id == null) {
    res.send({
      status: "incompleted",
      message: "You must have car ID.",
    });
    return;
  }
  var sql = "DELETE FROM vehicles WHERE vehicle_id = ?";
  try {
    var result = await queryDB(sql, vehicle_id);
    res.send({ message: "Deleted vehicle already" }, 200);
  } catch (err) {
    console.log(err);
    res.send(err, 500);
    return;
  }
});

module.exports = router;
