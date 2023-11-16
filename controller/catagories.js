const mongoose = require('mongoose');

const catagoriesModel = require('../model/catagories');
const ErrorHandler = require('../utils/errorHandling');
const productModel = require('../model/product')
const asyncCatchHandler = require('../middleware/catchAsyncError')
const pagination = require('../utils/pagination')
const filter = require('../utils/filter')
const { logs } = require('../utils/logs')

exports.addCatagories = asyncCatchHandler(async (req, res, next) => {

    const { catagories_name, catagories_status } = req.body;
    const checkCatregory = await catagoriesModel.findOne({ catagories_name: catagories_name })

    if (checkCatregory) {
        return res.json({
            success: false,
            message: 'Category is already created'
        })
    }
    const model = await new catagoriesModel({

        catagories_name,
        catagories_image: process.env.BASE_URL + "/" + req.file.path,
        catagories_status
    });
    const store = await model.save()
    await logs(null, null, null, null, store._id, null, null, null, null, null, null, null, null, null, "Add category", `${catagories_name} category has been added from ${req?.user?.user_name}`, req, res, next)

    return res.status(200).json({
        success: true,
        message: req.t('Product Categories is uploaded successfully'),

    });


})

exports.allCatagories = asyncCatchHandler(async (req, res, next) => {
    let allCatagory
    if (req.query.filter) {
        allCatagory = await filter(catagoriesModel.find({
            catagories_status: { $ne: "Deleted" },
            $or: [{ catagories_name: new RegExp(req.query.filter, 'i') }, { catagories_status: new RegExp(req.query.filter, 'i') }]
        })
            .sort({ createdAt: -1 }), req)
    } else {
        allCatagory = await pagination(catagoriesModel.find({ catagories_status: { $ne: "Deleted" } })
            .sort({ createdAt: -1 }), req)
    }

    res.json({
        success: true,
        totalRecord: allCatagory.totalRecord,
        currentPage: allCatagory.currentPage,
        totalPage: allCatagory.totalPage,
        allCatagory: allCatagory.data
    })
})

exports.deleteCatagories = asyncCatchHandler(async (req, res, next) => {
    const id = req.params.id;
    catagoriesModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(id) }, { catagories_status: 'Deleted' }).then(data => {

        if (!data) {
            return next(new ErrorHandler(req.t('Categories not found'), 200))

        }
        res.json({
            success: true,
            message: req.t("Categories is deleted successfully")
        })
    })

})

exports.updateCatagories = asyncCatchHandler(async (req, res, next) => {
    const { id } = req.params
    const { catagories_status, catagories_name } = req.body
    const product = await catagoriesModel.findOne({ _id: mongoose.Types.ObjectId(id) })
    if (!product) {
        return next(new ErrorHandler(req.t('Categories not found'), 200))
    }
    const checkCatregory = await catagoriesModel.findOne({
        _id: { $ne: mongoose.Types.ObjectId(id) },
        catagories_name: catagories_name,

    });

    if (checkCatregory) {
        return res.json({
            success: false,
            message: "Category is already created",
        });
    }
    const image = req.file ? process.env.BASE_URL + "/" + req.file.path : "";
    if (image && !image.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/)) {
        return next(new ErrorHandler(req.t('Only JPG ,PNG and JPEG file format is supported'), 422))
    }
    catagories_name ? product.catagories_name = catagories_name : catagories_name
    catagories_status ? product.catagories_status = catagories_status : catagories_status
    image ? product.catagories_image = image : product.catagories_image
    product.save()
    res.json({
        success: true,
        message: req.t('Category is updated successfully'),
        Catagories: product
    })


})

exports.productCatagories = asyncCatchHandler(async (req, res, next) => {
    const { product_catagory_id } = req.params
    const categoryVerify = await catagoriesModel.findOne({ _id: mongoose.Types.ObjectId(product_catagory_id), catagories_status: 'Active' })
    if (!categoryVerify) {
        return next(new ErrorHandler(req.t('Categories not found'), 200))
    }
    const product = await productModel.find({ product_catagory_id: mongoose.Types.ObjectId(product_catagory_id), product_status: 'Active' })


    return res.json({
        success: true,
        data: product
    })


})