
const validationResult = require('express-validator').validationResult;
const { check } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    let data=errors.array()
   
    if (!errors.isEmpty()) return res.status(422).json({ errors: data });
    next();
};

module.exports.subsidyValidator = [
    check('company_id').trim().not().isEmpty().withMessage('company id must be required'),
    check('canteen_id').not().isEmpty().withMessage('Canteen id must be required'),
    check('subsidy').notEmpty().withMessage('subsidy must be required').isNumeric().withMessage('subsidy must be in numbers'),
    check('subsidy_type').notEmpty().withMessage('subsidy type must be required'),
    check('status').notEmpty().withMessage('subsidy status must be required'),
    check('start_date').notEmpty().withMessage('subsidy start date must be required'),
    check('end_date').notEmpty().withMessage('subsidy end date must be required'),
  
    validate
];