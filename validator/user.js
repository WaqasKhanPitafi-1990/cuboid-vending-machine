
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



module.exports.userValidator = [
    check('user_name').trim().not().isEmpty().withMessage('Name must be required'),
    check('user_email').notEmpty().withMessage('user email must be required').isEmail().withMessage('Email must be in email format'),
    check('user_phone').notEmpty().withMessage('Phone number must be required'),
    check('user_role_id').notEmpty().withMessage('User role id must be required'),
    check('user_status').notEmpty().withMessage('User status must be required'),

    check('user_password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars long'),
    validate
];