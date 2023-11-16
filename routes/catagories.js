const express = require('express');

const { addCatagories, allCatagories, deleteCatagories, updateCatagories,productCatagories } = require('../controller/catagories');
const userAuth = require('../middleware/userAuth')
const Auth = require('../middleware/auth');
const {catagoryValidator}=require('../validator/catagory')
const multer = require('multer');
const path = require('path');
const router = express();
const storage = multer.diskStorage(
    {
        destination: 'public/uploads/category',
        filename: function (req, file, cb) {
            const extension = (path.extname(file.originalname)).toLowerCase();
            cb(null, file.originalname.split('.')[0] + '-' + Date.now() + extension);
        }
    }
);
const upload = multer({ storage: storage });


router.post('/', userAuth,  userAuth,Auth("category_create"),upload.single('catagories_image'),catagoryValidator, addCatagories);
router.get('/', userAuth,Auth("category_view"), allCatagories);
router.delete('/:id', userAuth,Auth("category_delete"), deleteCatagories);
router.put('/:id', userAuth, Auth("category_edit"),upload.single('catagories_image'), updateCatagories);


router.get('/product_catagory_id/:product_catagory_id', userAuth, Auth("update-category"), productCatagories);


module.exports = router;