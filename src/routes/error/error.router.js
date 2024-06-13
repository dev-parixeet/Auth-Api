const { Router } = require("express");
const { RouteWorking } = require("../../controller/error");
const router = Router;

router.get("/error", RouteWorking);

module.exports = router;