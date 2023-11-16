
const validationResult = require('express-validator').validationResult;
const { check } = require('express-validator');

const validate = (req, res, next) => {
  
    const errors = validationResult(req);
    let data=errors.array()
    for(let i=0;i<data.length;i++){
     data[i].msg=req.t(data[i].msg)
    }

    if (!errors.isEmpty()) return res.status(422).json({ errors: data});


    next();
};


module.exports.machineValidator = [

    check('canteen_id').trim().notEmpty().withMessage('Canteen id must be required'),
    check('machine_name').trim().notEmpty().withMessage('Machine name must be required'),
    check('payment_method').isArray().isLength({min:1}).withMessage('Payment method must be required'),
    check('machine_location').trim().notEmpty().withMessage('Machine location must be required'),
    check('machine_status').trim().notEmpty().withMessage('Machine status must be required'),
    validate
];


