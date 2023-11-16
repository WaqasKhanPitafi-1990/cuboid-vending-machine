
const express = require('express');
const Auth = require('../middleware/auth');
const router = express.Router();
const userAuth = require('../middleware/userAuth');
const {machineValidator}=require('../validator/machine');
// const { addMachine, listMachine, allMachine, displayMachineProduct, allMachineProductAdminSide, deleteMachine, updateMachine, addChannel, deleteMachineChannel, listMacineChannel,listMachineByCanteenId, displayMachineChannel, updateMachineChannel } = require('../controller/machine')


const { 
    addMachine,updateMachineTemperature,updateTemperature,
    listMachineByCanteenId, allMachineProductAdminSide, displayMachineProduct,
    listMachine, allMachine, deleteMachine, updateMachine, 
    deleteMachineChannel, listMacineChannel, displayMachineChannel, 
    updateMachineChannel, requestMachineStatusFromMachine, updateMachineStatus, 
    updateMachineLightStatus, getMachineData, updateMachineProgrammingTimingWait,
    sendRequestChannelsScanDataForMachine, updateChannelsScannedForMachine,
    resetPercentageChannelsStatusValue, getChannelsMapping, updateChannelsMappingInExistingChannels,
    requestForResetFaults, readRequestForMachineFaults } = require('../controller/machine');
// const { addChannel } = require('../controller/channel')


router.post('/', userAuth, Auth('machine_create'),machineValidator, addMachine);
router.get('/', userAuth, Auth('machine_view'), allMachine);

router.put('/:id', userAuth, Auth('machine_edit'), listMachine);
router.patch('/:id', userAuth, Auth('machine_edit'), updateMachine);
router.delete('/:id', userAuth, Auth('machine_delete'), deleteMachine);

router.patch('/update_temperature/machine_id/:machine_id', userAuth, updateMachineTemperature);//Auth('machine_temperature_edit')
router.patch('/machine_controller/update_temperature',  updateTemperature);
router.get('/:id', userAuth, Auth('list-machines-by-canteen'), listMachineByCanteenId);
/////

/// Display Machine Product

router.get('/admin_side_product/', userAuth, Auth('admin-side-product'), allMachineProductAdminSide);
router.get('/product/:machine_id', userAuth, Auth('display-machine-product'), displayMachineProduct);

//The backend will call this API and request for machine status
router.get('/request_machine_status_from_machine/:canteen_id/:machine_id', requestMachineStatusFromMachine);

router.get('/update_machine_status/:canteen_id/:machine_number/:machine_status/:door_status/:light_status/:machine_communication_status/:dispense_status/:temperature', updateMachineStatus);

router.get('/update-machine-light-status/:canteen_id/:machine_id/:light_status', updateMachineLightStatus);

router.get('/get-machine-data/:machine_id',userAuth, getMachineData);

router.patch('/update-programming-time-waiting/machine_id/:machine_id', userAuth, updateMachineProgrammingTimingWait);//Auth('machine_temperature_edit')

//request sent from front end to backend to machine controller
router.get('/send-request-channels-scan-data-for-machine/:machine_id', sendRequestChannelsScanDataForMachine);//request sent from machine controller to backend providing the channels map of the machine

router.get('/reset-machine-percentage-channels-status-value/:machine_id', userAuth, resetPercentageChannelsStatusValue);
router.get('/get-channels-mapping/:machine_id', userAuth, getChannelsMapping);
router.get('/update-channels-mapping-in-existing-channels/:machine_id', userAuth, updateChannelsMappingInExistingChannels);
router.get('/request-for-reset-faults/:machine_id', userAuth, requestForResetFaults);
router.get('/read-request-for-machine-faults/:machine_id', userAuth, readRequestForMachineFaults);

module.exports = router;
