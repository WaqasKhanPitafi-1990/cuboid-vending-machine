const express = require('express');

const {addEvent,getEvent,emailedEvent} = require('../controller/event');

const {eventValidator}=require('../validator/event')
const multer = require('multer');
const path = require('path');
const router = express();


router.post('/',eventValidator, addEvent);
router.get('/', getEvent);
router.get('/emailed', emailedEvent);


module.exports = router;