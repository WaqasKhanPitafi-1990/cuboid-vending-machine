const express = require('express');
const {companySubsidyContractBySuperAdmin,subCompanyContract} = require('../controller/companySubsidy');
const userAuth = require('../middleware/userAuth');
const router = express();
const Auth = require('../middleware/auth');

// Display Total canteen subsidy subsidy 
router.get('/company', companySubsidyContractBySuperAdmin);
router.get('/sub_company',userAuth, subCompanyContract);

///////





module.exports = router;