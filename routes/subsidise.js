const express = require('express');

const router = express.Router();
const {subsidyValidator}=require('../validator/subsidy')
const {job,createSubsidy, getAllSubsidy, getSubsidy, deleteSubsidy,updateSubsidy} = require('../controller/subsidise');
const userAuth = require('../middleware/userAuth');
const Auth = require('../middleware/auth');


router.post('/',userAuth,Auth("subsidy_create"),subsidyValidator, createSubsidy );
router.get('/',userAuth,Auth("subsidy_view_all"),getAllSubsidy);
router.get('/:id',userAuth,Auth("subsidy_view"),getSubsidy);
router.delete('/:id',userAuth,Auth("subsidy_delete"),deleteSubsidy)
router.patch('/:id',userAuth,Auth("subsidy_edit"), updateSubsidy)
router.put('/job', job)

module.exports = router;