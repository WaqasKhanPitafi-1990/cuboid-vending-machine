
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


module.exports.canteenValidator = [

    check('canteen_name').trim().notEmpty().withMessage('Canteen name must be required'),
    check('canteen_location').trim().notEmpty().withMessage('Canteen location status must be required'),
    check('canteen_status').trim().notEmpty().withMessage('Canteen status must be required'),
    // check('food_supplier_id').trim().notEmpty().withMessage('Food Supplier must be required'),
    check('canteen_admin_id').trim().notEmpty().withMessage('Canteen Admin must be required'),
    check('machine_filler_id').trim().notEmpty().withMessage('Machine filler must be required'),
    validate
];


