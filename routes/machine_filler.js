
const express = require('express');
const {updateUserData, channelSetting,freeVend,inventoryUpdateByMachineFiller,displayMachines,displayMachineChannel,categoryProduct,machineCategory, displayMachineFillerCanteens,testLanguage,wasteInventory } = require('../controller/machine_filler');
const {updateMachineChannel,addChannel,addMachineRow} =require('../controller/channel')
const {allProduct}=require('../controller/product')
const userAuth = require('../middleware/userAuth');
const { freeVendValidator } = require('../validator/freeVend')
const { userValidator } = require('../validator/user');
const Auth = require('../middleware/auth');
const router = express();


// Machine Category
router.get('/channel_category/machine_id/:machine_id', userAuth,Auth("machine_category"), machineCategory);


// Active products 
router.get('/products', userAuth,allProduct );
// Active product by category in channels 

router.get('/category/machine_id/:machine_id', userAuth,Auth("category_product"), categoryProduct);

// Display Machine Filler Canteens
router.get('/machine_filler_id/:machine_filler_id', userAuth,Auth('machine_filler_canteens_view'), displayMachineFillerCanteens);


/// Machine associate with canteens
router.get('/machines/canteen_id/:canteen_id', userAuth, Auth('machine_filler_canteens_view'), displayMachines);


// Display Machine Channels
router.get('/machine_id/:machine_id', userAuth, Auth("channel_view"), displayMachineChannel);


/// Update Inventory in machines
router.patch('/inventory/machine_id/:machine_id', userAuth,Auth('update_inventory'), inventoryUpdateByMachineFiller);


/// Add Wastage by Machine Filler Side
router.patch('/wastage/machine_id/:machine_id', userAuth,Auth("waste_inventory"), wasteInventory);


// Channel setting update
router.patch('/channel_id/:channel_id', userAuth,Auth("update_machine_channel"), updateMachineChannel);


// Add new channel
router.post('/machine_id/:machine_id', userAuth,Auth("channel_create"), addChannel);


// Add new row 
router.post('/row/machine_id/:machine_id', userAuth,Auth("row_add"), addMachineRow);

//
router.post('/free_vending/canteen_id/:canteen_id', userAuth,Auth("freevend_validator"),freeVendValidator, freeVend);


//update user Data
router.patch('/update_user', userAuth, updateUserData);

// testing for localization [Language]
router.post('/', testLanguage);

module.exports = router;