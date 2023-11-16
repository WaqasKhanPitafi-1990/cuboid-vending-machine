
const express = require('express');
const {addWhiteList, displayWhiteList,deleteWhiteList, updateWhiteList,addBulkWhiteListUser} = require('../controller/whiteListUser');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Auth = require('../middleware/auth');
const { userValidator } = require('../validator/user');
const userAuth = require('../middleware/userAuth')

// Auth("white_list_user_create")
// Auth("white_list_user_view"),
router.post('/',userAuth,Auth("white_list_user_create"), addWhiteList);
router.get('/', userAuth,Auth("white_list_user_view"),  displayWhiteList);
router.delete('/user_id/:user_id', userAuth, Auth("white_list_user_delete"), deleteWhiteList);
router.put('/user_id/:user_id', userAuth, Auth("white_list_user_edit"), updateWhiteList);
router.post('/bulk_user', userAuth,Auth("white_list_user_bulk_create"), addBulkWhiteListUser);
module.exports = router;


