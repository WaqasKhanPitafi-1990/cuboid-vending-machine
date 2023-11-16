const express = require('express');
const Auth = require('../middleware/auth');

const { addPromotions, allPromotions, deletePromotions, updatePromotions,expirePromotions } = require('../controller/promotion');
const userAuth = require('../middleware/userAuth')
const {promotionValidator}=require('../validator/promotion')
const router = express();


router.post('/', userAuth, Auth("promotion_create"),promotionValidator,  addPromotions);
router.get('/', userAuth,  Auth("promotion_view"), allPromotions);
router.delete('/:id', userAuth,  Auth("promotion_delete"),  deletePromotions);
router.put('/:id', userAuth, Auth("promotion_edit"), updatePromotions);
router.put('/expire_promotions', userAuth, expirePromotions);

module.exports = router;



// add-promotion , all-promotion , delete-promotion , update-promotion