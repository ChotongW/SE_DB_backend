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

router.post(
  "/",
  userMiddleware.isLoggedIn,
  upload.single("file"),
  (req, res) => {
    res.send({ msg: "Test payment" });
  }
);

module.exports = router;
