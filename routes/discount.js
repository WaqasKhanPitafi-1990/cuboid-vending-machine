const express = require('express');
const router = express.Router()
const Auth = require('../middleware/auth');
const userAuth = require('../middleware/userAuth')
const { addDiscount, displayDiscount, deleteDiscount, searchDiscount, updateDiscount,subsidizing_products } = require('../controller/discount')
const {discountValidator}=require('../validator/discount')
// add-discount display-discount delete-discount subsidizing-products search-discount update-discount




router.post('/', userAuth,Auth("discount_create"),discountValidator, addDiscount);

router.get('/', userAuth,Auth("discount_view"), displayDiscount);

router.delete('/:id', userAuth,Auth("discount_delete"), deleteDiscount);
router.get('/sub', /*userAuth, Auth(["subsidizing-products",]),*/subsidizing_products);

router.put('/:id', userAuth,Auth("discount_edit"), searchDiscount);
router.patch('/:id', userAuth,userAuth,Auth("discount_edit"), updateDiscount);
module.exports = router;


