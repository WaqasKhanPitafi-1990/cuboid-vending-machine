const validationResult = require('express-validator').validationResult;
const { check } = require('express-validator');

const validate = (req, res, next) => {
    let errors = validationResult(req);
    let data=errors.array()
   for(let i=0;i<data.length;i++){
    data[i].msg=req.t(data[i].msg)
   }

    if (!errors.isEmpty()) return res.status(422).json({success:false, message: data });

    if (!req.file) {

        return res.status(422).json({success:false,errors:[{msg:req.t('Banner image must be required'),param:'banner_image'}]})
    }
    const image = req.file.path
    if (!image.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/)) {
const err=[{msg:req.t("Only JPG ,PNG and JPEG file format is supported"),param:'banner_image'}]
        return res.status(422).json({success:false,errors:err})
    }
    next();
};







module.exports.bannerValidator = [
    check('banner_title').trim().not().isEmpty().withMessage('banner title must be required'),
    // check('banner_description').notEmpty().withMessage('banner description must be required'),
    // check('file.image').notEmpty().withMessage('image must be required'),
    check('banner_status').isLength({ min: 6 }).withMessage('banner status  must be required'),
    check('banner_start_date').notEmpty().withMessage('banner start date must be required'),
    check('banner_end_date').notEmpty().withMessage('banner end date  must be required'),
    validate
];