
const validationResult = require('express-validator').validationResult;
const { check } = require('express-validator');

const validate = (req, res, next) => {

    const errors = validationResult(req);

    let data = errors.array()
    for (let i = 0; i < data.length; i++) {
        data[i].msg = req.t(data[i].msg)
    }

    if (!errors.isEmpty()) return res.status(422).json({ errors: data });


    next();
};


module.exports.freeVendValidator = [


    check('machine_id').trim().notEmpty().withMessage('machine id must be required'),
    check('product_id').trim().notEmpty().withMessage('product id must be required'),
    check('product_quantity').trim().notEmpty().withMessage('product quantity must be required').isNumeric().withMessage('product quantity must be in number'),
    check('product_price').trim().notEmpty().withMessage('product price must be required').isNumeric().withMessage('product price must be in number'),
    check('channel_id').trim().notEmpty().withMessage('channel id must be required'),

    validate
];


