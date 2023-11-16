const express = require('express');

const router = express.Router();



const {signup} =require('../validator/registration')

const { signupController, loginController, resetController, forgotController } = require('../controller/registration');





router.post('/signup', signup, signupController);

router.post('/login', loginController);

router.post('/forgot', forgotController);
router.post('/resetPassword', resetController);
module.exports = router;