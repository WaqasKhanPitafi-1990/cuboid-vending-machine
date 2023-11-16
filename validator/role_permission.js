
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


module.exports.rolePermissionValidator = [

    check('role_name').trim().notEmpty().withMessage('Role name must be required'),
    
    
    validate
];


