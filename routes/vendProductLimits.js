const express = require('express');

const {addProductVend,getVend,vendListing,deleteVendLimit,updateVendLimit} = require('../controller/vendProductLimits');
const { productVendValidator } = require('../validator/vendProductLimits')
const multer = require('multer');
const path = require('path');
const router = express();
const Auth = require('../middleware/auth');

// 
const userAuth = require('../middleware/userAuth');
router.post('/',userAuth,Auth("product_vend_add"),productVendValidator, addProductVend);
router.get('/canteen_id/:canteen_id',userAuth, getVend);
router.get('/',userAuth,Auth("product_vend_limit_list"), vendListing);
router.delete('/canteen_id/:canteen_id',userAuth,Auth("product_vend_delete"), deleteVendLimit);
router.patch('/canteen_id/:canteen_id',userAuth,Auth("product_vend_update"), updateVendLimit);



module.exports = router;