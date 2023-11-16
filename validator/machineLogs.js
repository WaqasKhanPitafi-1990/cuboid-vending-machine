
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


module.exports.priorityValidator = [

    check('title').trim().notEmpty().withMessage('log title must be required'),
    check('priority').trim().notEmpty().withMessage('priority level must be required').isNumeric('priority level must be in number'),
   
    validate
];


