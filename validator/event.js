
const validationResult = require('express-validator').validationResult;
const { check } = require('express-validator');

const validate = (req, res, next) => {
  
    const errors = validationResult(req);


    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });


    next();
};


module.exports.eventValidator = [

    check('canteen_id').trim().notEmpty().withMessage('Canteen id must be required'),
    check('machine_number').trim().notEmpty().withMessage('Machine number must be required').isNumeric().withMessage('machine number must be in Numeric'),
    check('status_of_event').trim().notEmpty().withMessage('status_of_event must be required'),
    check('event').trim().notEmpty().withMessage('event must be required'),
    validate
];


