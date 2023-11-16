const express = require('express');
const { addProduct, addBulkProduct,allProduct, deleteProduct, updateProduct, addImage } = require('../controller/product')
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Auth = require('../middleware/auth');
// const { validateProduct } = require('../middleware/validators/productValidator');
const userAuth = require('../middleware/userAuth')
const casheMiddleware=require('../middleware/redisMidleware')

const {productValidator}=require('../validator/product')
const {bulkProductValidator}=require('../validator/bulkProduct')
const storage = multer.diskStorage(
    {
        destination: 'public/uploads/product',
        filename: function (req, file, cb) {
            const extension = (path.extname(file.originalname)).toLowerCase();
            cb(null, file.originalname.split('.')[0] + '-' + Date.now() + extension);
        }
    }
);

const upload = multer({
    storage: storage
    // limits: { fileSize: 1 * 1024 * 1024 },
});




router.post('/', userAuth,  Auth("product_create"), upload.single('product_image'),productValidator,casheMiddleware, addProduct);

router.get('/',userAuth,  Auth("product_view"),  allProduct);

router.put('/:id', userAuth,  Auth("product_edit"), upload.single('product_image'), updateProduct);

router.delete('/:id', userAuth,  Auth("product_delete"), deleteProduct);
router.post('/add', userAuth,Auth("bulk_product_create"),bulkProductValidator, addBulkProduct);

// router.post('/add/:id', upload.array('Image', 3), addImage);
module.exports = router;

// add-product update-product "delete-product"