
const express = require('express');
const { wastageData,addWastage,allWastage,deleteWastage,updateWastage } = require('../controller/wastage');
const router = express.Router();

const Auth = require('../middleware/auth');
const { wastageValidator } = require('../validator/wastage');
const userAuth = require('../middleware/userAuth')




router.post('/', userAuth,Auth('wastage_create'), wastageValidator, addWastage);
router.get('/',  userAuth,Auth('wastage_view'), allWastage);
router.delete('/:wastage_id',userAuth,Auth('wastage_delete'), deleteWastage);
router.patch('/:wastage_id',userAuth,Auth('wastage_edit'), updateWastage);

router.get('/all',  userAuth,Auth('wastage_view'), wastageData);


module.exports = router;

