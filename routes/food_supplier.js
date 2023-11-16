const express = require('express');

// machineCanteen
const { assignCanteen, supplierCanteen, machineCanteen } = require('../controller/food_supplier')
const router = express.Router();

const Auth = require('../middleware/auth');
const userAuth = require('../middleware/userAuth');




router.get('/assign/canteen_id/:canteen_id/food_supplier_id/:food_supplier_id', userAuth, assignCanteen);
router.get('/:food_supplier_id', userAuth, supplierCanteen);

router.get('/machine_canteen/:canteen_id', userAuth, machineCanteen);



/// Display machince against 1 canteen
// router.get('/machine_canteen/:canteen_id', userAuth, machineCanteen);
/// Display all canteen against 1 company

module.exports = router;