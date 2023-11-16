const express = require('express');
const Auth = require('../middleware/auth');
const router = express.Router();
const userAuth = require('../middleware/userAuth')

const {
   allFreeVend
} = require("../controller/freeVend");

router.get('/', userAuth,Auth("freevend_view"), allFreeVend);


module.exports = router; 