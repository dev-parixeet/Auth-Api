const {Router} = require ('express')
const router =Router();
const authroute =require('./auth.router')

router.use("/auth", authroute);

module.exports = router