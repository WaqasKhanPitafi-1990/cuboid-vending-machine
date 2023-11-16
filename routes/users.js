
const express = require('express');
const {whiteListUser,allCompanyAdmin,displayMachineFiller,addBulkUser, supplierMachineFiller,canteenAdminUsers, addUser, supplierUser, allUser, deleteUser, updateUser, userProfile, deleteProfile, getUser, showProfile, getUserDetailsById, gdprAcceptance, sendGDPREmail } = require('../controller/users');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Auth = require('../middleware/auth');
const { userValidator } = require('../validator/user');
const userAuth = require('../middleware/userAuth')
const storage = multer.diskStorage(
    {
        destination: 'public/uploads/users',
        filename: function (req, file, cb) {
            const extension = (path.extname(file.originalname)).toLowerCase();
            cb(null, file.originalname.split('.')[0] + '-' + Date.now() + extension);
        }
    }
);

const upload = multer({ storage: storage });

router.post('/',userAuth,Auth("user_create"),userValidator, addUser);
router.post('/bulk',userAuth, Auth("bulk_user_create"), addBulkUser);
router.get('/', userAuth, Auth("user_view"), allUser);
router.delete('/:id', userAuth, Auth("user_delete"), deleteUser);
router.put('/:id', userAuth, Auth("user_edit"), updateUser);
router.get('/company_admin', userAuth, allCompanyAdmin);


router.delete('/profile/:id', userAuth, deleteProfile);
router.put('/profile/:id', userAuth, upload.single('profile'), userProfile);
router.get('/white_list',Auth("white_list_user"), userAuth, whiteListUser);

// get all active machine filler
router.get('/machine_filler',userAuth, displayMachineFiller);
// router.get('/get_user/:id', userAuth, getUser);

// display all canteens admin
router.get('/canteen_admins', userAuth, canteenAdminUsers);
// All Supplier
router.get('/supplier_user', userAuth, supplierUser);
router.post('/gdpr-acceptance', gdprAcceptance);
router.get('/get-user-details-by-id/:user_id?/:gdprToken?', getUserDetailsById);
router.post('/send-gdpr-email', sendGDPREmail);
/// All machine filler under 1 supplier

// router.get('/machine_fillers/:food_supplier_id', userAuth, supplierMachineFiller);
module.exports = router;


// add-user , all-user , delete-user , update-user