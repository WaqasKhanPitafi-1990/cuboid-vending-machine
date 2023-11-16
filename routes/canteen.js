const express = require('express');
const {displayAdminCanteens, addCanteen,updatecanteenAdmin,endPointCanteen, supplierCanteen, allCanteen, deleteCanteen, updateCanteen, searchCanteen,canteenAdmin } = require('../controller/canteen')

const { assignCanteen, machineCanteen } = require('../controller/canteen')
const {canteenValidator}=require('../validator/canteen')
const router = express.Router();

const Auth = require('../middleware/auth');
const userAuth = require('../middleware/userAuth');



router.post('/', userAuth, Auth("canteen_create"),canteenValidator,addCanteen);

router.get('/', userAuth, Auth("canteen_view"),allCanteen);

router.put('/:id', userAuth,Auth("canteen_edit"), updateCanteen);
router.get('/:id', userAuth,Auth("canteen_edit"), searchCanteen);

router.delete('/:id', userAuth,Auth("category_delete"), deleteCanteen);
router.post('/canteen_id', endPointCanteen);

router.post('/canteen_admin/canteen_id/:canteen_id/canteen_admin_id/:canteen_admin_id', userAuth,Auth('assign-canteen'), canteenAdmin);
router.patch('/canteen_admin/canteen_id/:canteen_id/canteen_admin_id/:canteen_admin_id', userAuth,Auth('update-canteen-admin'), updatecanteenAdmin);
router.get('/display_canteen_admin/canteen_admin_id/:canteen_admin_id', userAuth,Auth('display-canteen-admin-canteens'), displayAdminCanteens);

//  add-canteen all-canteen update-canteen search-canteen delete-canteen




/// Display machince against 1 canteen
router.get('/machine_canteen/:canteen_id', userAuth, machineCanteen);
/// Display all canteen against 1 company


// router.post('/add/:id', upload.array('Image', 3), addImage);
module.exports = router;