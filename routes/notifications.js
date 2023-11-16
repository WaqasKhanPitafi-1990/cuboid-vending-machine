const express = require('express');
const router = express.Router();
const userAuth = require('../middleware/userAuth')

const {adminNotifications} = require('../controller/notifications');

router.post('/admin-notifications', adminNotifications);

module.exports = router;
