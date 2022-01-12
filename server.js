const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(fileUpload({}));

app.use(cors());

require("./app/api/routes")(app);

// handle 404 error
app.use(function (req, res, next) {
  let err = new Error("Not found");
  err.status = 404;
  next(err);
});

// handle errors
app.use(function (err, req, res, next) {
  if (err.status === 404) res.status(404).json({ message: "Not found" });
  else if (err.status === 401)
    res.status(401).json({ message: "Authorization error" });
  else
    res
      .status(err.status || 500)
      .send({ success: false, message: err.message });
});

app.listen(PORT, function () {
  console.log(`Node server is listening on port ${PORT}`);
});
