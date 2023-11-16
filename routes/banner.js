
const express = require('express');
const { addBanner, deleteBanner, updateBanner, allBanner, machineBanner } = require('../controller/banner');
const userAuth = require('../middleware/userAuth');
const multer = require('multer');
const path = require('path');
const Auth = require('../middleware/auth');
const router = express();
const { bannerValidator } = require('../validator/banner')
const storage = multer.diskStorage(
    {
        destination: 'public/uploads/banner',
        filename: function (req, file, cb) {
            const extension = (path.extname(file.originalname)).toLowerCase();
            cb(null, file.originalname.split('.')[0] + '-' + Date.now() + extension);
        }
    }
);

const upload = multer({ storage: storage });


router.post('/', userAuth, Auth("banner_create"), upload.single('banner_image'), bannerValidator, addBanner);
router.delete('/:id', userAuth, Auth("banner_delete"), deleteBanner);
router.put('/:id', userAuth, Auth("banner_edit"), upload.single('banner_image'), updateBanner);
router.get('/', userAuth, Auth("banner_view"), allBanner);

router.get('/:banner_canteen_id', userAuth, Auth("machine-banner"), machineBanner);

module.exports = router;