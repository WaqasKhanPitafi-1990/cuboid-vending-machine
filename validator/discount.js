
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


module.exports.discountValidator = [

    check('discount_name').trim().notEmpty().withMessage('Discount name must be required'),
    check('discount_type').trim().notEmpty().withMessage('Discount type must be required'),
    check('discount_value').trim().notEmpty().withMessage('Discount value must be required').isNumeric().withMessage("Discount percentage must be in number"),
    check('discount_end_date').trim().notEmpty().withMessage('Discount start date must be required').isDate().withMessage("Discount start date must be in date format"),
    check('discount_start_date').trim().notEmpty().withMessage('Discount end date must be required').isDate().withMessage("Discount end date must be in date format"),
    
  
    validate
];


