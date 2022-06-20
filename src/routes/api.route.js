const router = require('express').Router();
const {scraptController}=require("../controllers/app.Controller")
router.post('/', scraptController);

module.exports = router;
