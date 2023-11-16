
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

module.exports.wastageValidator = [
    check('wastage_canteen_id').trim().not().isEmpty().withMessage('Canteen name must be required'),
    check('wastage_machine_id').trim().notEmpty().withMessage('Machine must be required'),
    check('wastage_product_id').trim().notEmpty().withMessage('Product must be required'),
    check('wastage_product_quantity').notEmpty().withMessage('Waste product quantity must be required').isNumeric().withMessage('Product quantity must be in numbers').isInt({min:1}).withMessage('wastage product have atleast 1 quantity'),
  
    validate
];