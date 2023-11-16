const validationResult = require('express-validator').validationResult;
const { check } = require('express-validator');

const validate = (req, res, next) => {
  
    const errors = validationResult(req);

    let data=errors.array()
    for(let i=0;i<data.length;i++){
     data[i].msg=req.t(data[i].msg)
    }
    if (!errors.isEmpty()) return res.status(422).json({ errors: data });


    next();
};


module.exports.channelValidator = [
   check('row_number').trim().not().isEmpty().withMessage('channel row number must be required'),
  
    check('channel_product_threshold').trim().not().isEmpty().withMessage('product threshold must b required').isNumeric().withMessage('product threshold must be in number'),
    check('channel_product_limit').trim().not().isEmpty().withMessage('channel product limit must b required').isNumeric().withMessage('channel product limit must be in number'),
    check('channel_product_id').trim().not().isEmpty().withMessage('product must be required'),
    check('channel_product_quantity').trim().not().isEmpty().withMessage('product quantity must be required').isNumeric().withMessage('quantity must be in numbers'),
    check('channel_extraction_time').trim().notEmpty().withMessage('channel extraction time  must be required'),
    validate
];


