const express = require("express");
const bodyParser = require("body-parser");
const db = require("../config/db");
const upload = require("../storage/multer");
const blob = require("../storage/blobPayment");
const userMiddleware = require("../middleware/user");
var uuid = require("uuid");

router = express.Router();
router.use(express.json());
router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

router.get("/admin", userMiddleware.isLoggedIn, (req, res) => {
  //let vehicle_id = req.query.vehicleId;
  /*
    if (vehicle_id == null){
        
    }
    */
  //console.log(vehicle_id);
  var sql = "SELECT * FROM billing";
  db.query(sql, (err, result) => {
    if (err) throw (err, res.status(500).send(err));
    //console.log(rows);
    res.send(result);
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

router.post(
  "/",
  userMiddleware.isLoggedIn,
  upload.single("file"),
  (req, res) => {
    res.send({ msg: "Test payment" });
  }
);

module.exports = router;
