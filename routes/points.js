const express = require('express');

const router = express.Router();
const {subsidyValidator}=require('../validator/subsidy')
const {addPoints, getUserPoints} = require('../controller/points');
const userAuth = require('../middleware/userAuth');



router.post('/',userAuth, addPoints );
router.get('/user_id/:user_id',userAuth, getUserPoints);


module.exports = router;