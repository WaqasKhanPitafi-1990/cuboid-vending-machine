const validationResult = require('express-validator').validationResult;
const { check } = require('express-validator');

const validate = (req, res, next) => {
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    next();
};


module.exports.bulkProductValidator = [
 
    // check('product_catagory_id').trim().notEmpty().withMessage('Product catagory must be required'),
    check('data').isArray().withMessage('Product data must be in array').isLength({min:1}).withMessage('product data must be greater than 0'),
    validate
];


