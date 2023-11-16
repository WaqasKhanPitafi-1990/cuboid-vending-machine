
const express = require('express');
const Auth = require('../middleware/auth');
const router = express.Router();
const userAuth = require('../middleware/userAuth');
const {channelValidator}=require('../validator/channel');
const { 
    machineProduct,
    addChannel,
    addMachineRow,
    deleteMachineRow, 
    unMergeMachineChannel, 
    displayMachineChannel, 
    mergeChannel, 
    updateMachineChannel, 
    deleteMachineChannel, 
    emailOnThreshold, 
    updateChannelMachineStatus, 
    requestChannelStatusFromMachine,
    removeProductFromChannel
 } = require('../controller/channel');

////////       Add Channel

// router.patch('/channel/:machine_id', userAuth, Auth(["add-channel",]), addChannel);

router.post('/machine_id/:machine_id', userAuth, Auth('channel_create'),channelValidator, addChannel);


/// Display Channel
router.get('/:machine_id', userAuth, Auth('channel_view'), displayMachineChannel);


router.patch('/:channel_id', userAuth, Auth('channel_edit'), updateMachineChannel);
router.delete('/:channel_id/machine_id/:machine_id/row_number/:row_number', userAuth, Auth('channel_delete'), deleteMachineChannel);
router.patch('/machine_id/:machine_id/merge_with/:merge_with',userAuth, Auth('channel_merge'), mergeChannel);


router.patch('/unmerge/channel_id/:channel_id', userAuth,Auth('channel_unmerge'), unMergeMachineChannel);


router.delete('/machine_id/:machine_id/row_number/:row_number', userAuth,Auth('row_delete'), deleteMachineRow);

router.post('/row/machine_id/:machine_id', userAuth,Auth('row_add'), addMachineRow);

// API for Machine Controller
router.get('/machine_product/canteen_id/:canteen_id',  machineProduct);

router.post('/email', emailOnThreshold);

//Machine controller will call this
router.get('/update_channel_machine_status/:canteen_id/:machine_number/:tray_number/:channel_number/:status/:percentageOfChannelsStatusUpdated', updateChannelMachineStatus);
//The backend will call the machine controller
router.get('/request_channel_status_from_machine/:canteen_id/:machine_id', requestChannelStatusFromMachine);

// router.delete('/:channel_id/machine/:machine_id', userAuth, deleteMachineChannel);
// router.get('/:machine_id', userAuth, displayMachineChannel);
// router.put('/channel/:channel_id/machine/:machine_id', userAuth, listMacineChannel);
router.delete('/remove-product/:channel_id', userAuth, removeProductFromChannel);

module.exports = router;
