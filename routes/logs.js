
const express = require('express');
const Auth = require('../middleware/auth');
const router = express.Router();
const userAuth = require('../middleware/userAuth')


const {viewLogs} = require('../controller/logs')




router.get('/', userAuth, viewLogs);



module.exports = router;
