const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const config = require("config");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/userRouter");
const recipesRouter = require("./routes/recipesRouter");
const app = express();
app.use(
  cors({
    credentials: true,
    origin: config.get("origin"), // fix to deploy version
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/api/user", userRouter);
app.use("/api/recipes", recipesRouter);

const PORT = process.env.PORT || config.get("port");

const start = async () => {
  try {
    mongoose.connect("mongodb://localhost:27017/cookit", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.log("mongoose error", error);
  }
};

app.listen(PORT, () => {
  console.log("server has been started on port", PORT);
});

start();
