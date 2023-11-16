
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


module.exports.productVendValidator = [

    check('canteen_id').trim().notEmpty().withMessage('Canteen id must be required'),
    check('product_vend_limit').trim().notEmpty().withMessage('product_vend_limit must be required').isNumeric().withMessage('product_vend_limit must be in number'),
   
    validate
];


