
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


module.exports.promotionValidator = [

    check('promo_name').trim().notEmpty().withMessage('Promotion name must be required'),
    check('promo_code').trim().notEmpty().withMessage('Promotion code must be required'),
    check('promo_description').trim().notEmpty().withMessage('Promotion description must be required'),
    check('promo_start_date').trim().notEmpty().withMessage('Promotion start date must be required'),
    check('promo_end_date').trim().notEmpty().withMessage('Promotion end date must be required'),
    check('promo_type').trim().notEmpty().withMessage('Pomotion type must be required'),
    check('promo_value').trim().notEmpty().withMessage('Promotion value must be required').isNumeric().withMessage("promotion value must be in number"),
    // check('promo_productid').trim().notEmpty().withMessage('Promotion product must be required'),
    check('promo_status').trim().notEmpty().withMessage('Promotion status must be required'),
    validate
];


