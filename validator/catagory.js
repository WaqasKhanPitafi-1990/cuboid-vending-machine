
const validationResult = require('express-validator').validationResult;
const { check } = require('express-validator');
const res = require('express/lib/response');

const validate = (req, res, next) => {
  
    const errors = validationResult(req);
    let data=errors.array()
    for(let i=0;i<data.length;i++){
     data[i].msg=req.t(data[i].msg)
    }

    if (!errors.isEmpty()) return res.status(422).json({success:false, errors: data });
    
    if (!req.file) {

        return res.status(422).json({success:false,errors:[{msg:req.t('Category image must be required'),param:'catagories_image'}]})
    }
    const image = req.file.path
    if (!image.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/)) {
const d=[{msg:req.t("Only JPG ,PNG and JPEG file format is supported"),param:'file'}]
        return res.status(422).json({success:false,errors:d})
    }

    next();
};


module.exports.catagoryValidator = [

    check('catagories_name').trim().notEmpty().withMessage('Categories name must be required'),
    check('catagories_status').trim().notEmpty().withMessage('Categories status must be required'),
    // check('catagories_image').trim().notEmpty().withMessage("Image must be required"),
    validate
];


