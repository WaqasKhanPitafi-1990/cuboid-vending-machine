const express = require('express');
const {getAllCompany,subCompanies,companyWhiteListUSer,displayCompanyAssociateWithCanteen,contractCompanyWithCuboid} = require('../controller/company');

const {eventValidator}=require('../validator/event')
const multer = require('multer');
const path = require('path');
const userAuth = require('../middleware/userAuth');
const router = express();
const Auth = require('../middleware/auth');

router.get('/',userAuth,Auth("company_view"), getAllCompany);
router.get('/company_white_list_user/user_parent_id/:user_parent_id',userAuth,Auth("company_whitelist_user"),companyWhiteListUSer);
router.get('/canteen_id/:canteen_id',userAuth,Auth("company_with_canteen_view"),Auth("company_contract_with_cuboid"),displayCompanyAssociateWithCanteen);
router.get('/contract/canteen_id/:canteen_id',userAuth,Auth("company_with_canteen_view"), contractCompanyWithCuboid);
router.get('/sub_company',userAuth,Auth("subcompanies_view"), subCompanies);



module.exports = router;