const express = require("express");
const bodyParser = require("body-parser");
const queryDB = require("../config/db");
const upload = require("../storage/multer");
const blob = require("../storage/blobPayment");
const userMiddleware = require("../middleware/role");
const fs = require("fs");
var uuid = require("uuid");

router = express.Router();
router.use(express.json());
router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

router.get("/admin", userMiddleware.isAdmin, (req, res) => {
  //let vehicle_id = req.query.vehicleId;
  //console.log(vehicle_id);
  queryDB(
    "SELECT * FROM billing WHERE bill_status = ?",
    "verification",
    (err) => {
      //console.log(err);
      res.send(err, 500);
      throw err;
    },
    (result) => {
      res.send(result);
    }
  );
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

router.put(
  "/",
  userMiddleware.isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    let slip = req.file;
    //ส่ง bill_id กลับมาด้วยนะ *** เป็น form-data นะ ***
    let bill_id = req.body.bill_id;
    //let booking_status = req.booking_status;
    if (slip == null) {
      res.send({
        status: "incompleted",
        message: "You should upload payment slip.",
      });
    }
    try {
      var callback = await blob.payment_upload(slip);
      console.log(callback);
      //res.send('File uploaded successfully');
      console.log("File uploaded successfully");
    } catch (error) {
      console.log(error);
      res.status(500).send("Failure uploading");
    }
    fs.unlink(slip.path, (err) => {
      if (err) throw err;
      // if no error, file has been deleted successfully
      console.log("Local file deleted!");
    });
    queryDB(
      "UPDATE billing SET slip =  ?, bill_status = ? WHERE bill_id = ?;",
      [callback, "verification", bill_id],
      (err) => {
        console.log(err);
        res.send(500, { response: err });
      },
      () => {
        res.send(201, { response: "upload slip already" });
      }
    );
  }
);

router.put("/admin/approve", userMiddleware.isAdmin, (req, res) => {
  //ส่ง bill_id กลับมาด้วยนะ *** เป็น form-data นะ ***
  let bill_id = req.body.bill_id;
  //let booking_status = req.booking_status;
  if (bill_id == null) {
    res.send({
      status: "incompleted",
      message: "No bill found or bill id is null.",
    });
  }
  queryDB(
    "UPDATE billing SET bill_status =  ? WHERE bill_id = ?;",
    ["complete", bill_id],
    (err) => {
      console.log(err);
      res.send(500, { response: err });
    },
    () => {
      res.send(201, { response: "bill update already" });
    }
  );
});

function createBill(cost, id_no) {
  var id = uuid.v4();

  if (id_no == null || cost == null) {
    console.log({ message: "parameters is undefine, create bill failed." });
    return null;
  }

  var tax_amount = cost * 0.07;
  var total_amount = cost + tax_amount;

  queryDB(
    "INSERT INTO billing (bill_id, bill_status, amount_balance, total_amount, tax_amount) VALUES (?, ?, ?, ?, ?)",
    [id, "pending", cost, total_amount, tax_amount],
    (err) => {
      console.log(err);
      return { message: err };
    },
    () => {
      console.log({ message: "billed already" });
      return { message: "billed already" };
    }
  );
  console.log(id_no);
  queryDB(
    "UPDATE customer SET bill_id = ? WHERE id_no = ?;",
    [id, id_no],
    (err) => {
      console.log(err);
    },
    () => {
      console.log({ message: "update customer bill_id already" });
    }
  );
}

module.exports = {
  router,
  createBill,
};
