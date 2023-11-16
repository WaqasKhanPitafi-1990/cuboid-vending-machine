
const express = require('express');
const Auth = require('../middleware/auth');
const router = express.Router();
const userAuth = require('../middleware/userAuth')
const {machineValidator}=require('../validator/machine')
// const { addMachine, listMachine, allMachine, displayMachineProduct, allMachineProductAdminSide, deleteMachine, updateMachine, addChannel, deleteMachineChannel, listMacineChannel,listMachineByCanteenId, displayMachineChannel, updateMachineChannel } = require('../controller/machine')


const { machineTemperatueLog } = require('../controller/machineTemperatureLogs')
// const { addChannel } = require('../controller/channel')


// router.post('/', userAuth, Auth("machine_create"),machineValidator, addMachine);
router.get('/machine_id/:machine_id', userAuth,  machineTemperatueLog);


module.exports=router