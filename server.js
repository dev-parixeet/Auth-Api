const express = require("express");
const path = require("path");
const app = express();
const session = require("express-session");
const PORT = 8080;
const connectDB = require("./db/dbConnection");
const indexRoute = require("./src/routes/index");
const cors = require("cors");
const User = require("./src/model/User.model");
const { connectMailTransport } = require("./src/utils/util");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./src/view"));

app.use(express.json());

app.use(cors());

app.use("", indexRoute);

app.get("/dashboard", (req, res) => {
  console.log("adasdasdsad", req.session);
  if (req.session) {
    res.send(`Welcome ${req.session}!`);
  } else {
    res.status(401).send("Please login to view this page");
  }
});

connectMailTransport();
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);

  if (err.status === 404) {
    res.render("404", { message: "Page Not Found : 404", status: 404 });
  } else if (err.status === 500) {
    res.render("500", { message: "Server Not Found : 500", status: 500 });
  } else {
    res.render("error", { message: err.message, status: err.status });
  }
});

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running out on http://localhost:${PORT}/`);
});
