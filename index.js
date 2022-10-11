const express = require("express");
const app = express();
const index = require("./routes/vehicle");
const test = require("./routes/test");
const authen = require("./routes/authen");
const book = require("./routes/booking");
const payment = require("./routes/payment");
const user = require("./routes/user");
const db = require("./config/db");
const port = process.env.PORT || 5500;

const cors = require("cors");
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use("/vehicle", index);
app.use("/test", test);
app.use("/authen", authen);
app.use("/booking", book);
app.use("/payment", payment.router);
app.use("/user", user);

// db.connect(function (err) {
//     if (err) {
//         return console.error('error: ' + err.message);
//     }
//     console.log('Connected to the MySQL server.');
// })

app.get("/", (req, res) => {
  res.send("Home page");
});

app.listen(port, () => {
  console.log("Server is running on port", port);
});
