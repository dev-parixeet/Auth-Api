const { Router } = require("express");
const router = Router();
const userRoute = require("./user/index.router");

router.use("/user", userRoute);

module.exports = router;
