const express = require('express');
const Auth = require('../middleware/auth');
const router = express.Router();
const userAuth = require('../middleware/userAuth')

const {
  addQuantity,
  removeQuantity,
  inventory1,
  productsByMachine,
  allInventory1

} = require("../controller/inventory");

router.post('/add/channel_id/:channel_id/product_id/:product_id', userAuth,Auth('product_add'), addQuantity);
router.patch('/remove/channel_id/:channel_id/product_id/:product_id', userAuth,Auth('product_remove') ,removeQuantity);
router.post("/all",userAuth,Auth('inventory_view'), allInventory1)









module.exports = router; 