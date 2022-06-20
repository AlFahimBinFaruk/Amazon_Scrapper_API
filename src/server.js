const express = require("express");
const createError = require("http-errors");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();

const app = express();

//use others
app.use([
  cors(),
  morgan("dev"),
  express.json(),
  express.urlencoded({ extended: true }),
]);

//health route
app.get("/health", async (req, res, next) => {
  res.send({ message: "Awesome it works 🐻" });
});
//main route
app.use("/api/scrapt", require("./routes/api.route"));

//error handler
app.use((req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    status: err.status || 500,
    message: err.message,
  });
});

//listen server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
