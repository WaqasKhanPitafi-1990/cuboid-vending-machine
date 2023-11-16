const validationResult = require('express-validator').validationResult;
const { check } = require('express-validator');

const validate = (req, res, next) => {
  
    const errors = validationResult(req);
    let data=errors.array()
    for(let i=0;i<data.length;i++){
     data[i].msg=req.t(data[i].msg)
    }
    if (!errors.isEmpty()) return res.status(422).json({ errors: data });
    if (!req.file) {
        return res.status(422).json({success:false,errors:[{msg:req.t('Product image must be required'),param:'product_image'}]})
    }
    const image = req.file.path
    if (!image.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/)) {
const d=[{msg:req.t("Only JPG ,PNG and JPEG file format is supported"),param:'product_image'}]
        return res.status(422).json({success:false,errors:d})
    }

    next();
};


module.exports.productValidator = [
   check('product_name').trim().not().isEmpty().withMessage('Product name must be required'),
    check('product_price').trim().notEmpty().withMessage('Product price must be required').isNumeric().withMessage('product price must be in number'),
    check('product_max_limit').trim().notEmpty().withMessage('Product max limit must be required').isNumeric().withMessage('product max limit must be in number'),
    check('product_description').trim().notEmpty().withMessage('Product description must be required'),
    check('dispensing_speed').trim().notEmpty().withMessage('Product dispensing speed must be required').isNumeric().withMessage('product dispensing speed must be in Number').isFloat({min:0,max:19}).withMessage('dispensing speed must be between 0 to 19'),
    // check('product_description').trim().isLength({max:300}).withMessage('Product description must be less than 300 character.'),
    check('product_VAT').trim().notEmpty().withMessage('Product VAT must be required'),
    check('product_expiry_date').trim().notEmpty().withMessage('Product expiry date must be required'),
    check('product_catagory_id').notEmpty().withMessage('Product catagory must be required').isArray().isLength({min:1}).withMessage('Product catagory must be required'),
    check('product_recipes').trim().notEmpty().withMessage('Product recipes must be required'),
    check('product_allergies').trim().notEmpty().withMessage('Product allergies must be required'),
    check('product_number').trim().notEmpty().withMessage('Product number must be required'),
    // check('product_gradient').isArray().withMessage('Product gradient must be rein array'),
    validate
];


