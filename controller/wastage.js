// addWastage

const mongoose = require("mongoose");
const canteenModel = require('../model/canteen')
const productModel = require("../model/product");
const machineModel = require("../model/verdering");
const wastageModel = require('../model/wastage')

const asyncCatchHandler = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorHandling");
const pagination = require('../utils/pagination')
const { logs } = require('../utils/logs')

exports.addWastage = asyncCatchHandler(async (req, res, next) => {


    const { wastage_canteen_id, wastage_machine_id, wastage_product_id, wastage_product_quantity, wastage_status } = req.body;

    const canteen = await canteenModel.findOne({ _id: mongoose.Types.ObjectId(wastage_canteen_id), canteen_status: 'Active' })
    const product = await productModel.findOne({ _id: mongoose.Types.ObjectId(wastage_product_id), product_status: 'Active' })
    const machine = await machineModel.findOne({ _id: mongoose.Types.ObjectId(wastage_machine_id), machine_status: 'Active' })

    if (!canteen) {
        return next(new ErrorHandler(req.t("Canteen not found"), 200));
    }
    if (!product) {
        return next(new ErrorHandler(req.t("Product not found"), 200));
    }
    if (!machine) {
        return next(new ErrorHandler(req.t("Machine not found"), 200));
    }
    if (wastage_product_id < 1) {
        return next(new ErrorHandler(req.t("Product quantity must be greater than 0"), 422));
    }
    const model = await new wastageModel({
        wastage_canteen_id,
        wastage_machine_id,
        wastage_product_id,
        wastage_product_quantity,
        wastage_status

    })
    const store = await model.save();
    await logs(null, null, null, null, null, null, store._id, null, null, null, null, null, null, null, "Add wastage", `wastage has been added from ${req?.user?.user_name}`, req, res, next)


    return res.json({
        success: true,
        message: req.t('Wastage product is added successfully')
    })
})

exports.allWastage = asyncCatchHandler(async (req, res, next) => {

    const currentPage = Number(req.query.currentPage) || 1;
    const resultPerPage = Number(req.query.resultPerPage) || 10;
    const pagination = req.query.pagination || "true";

    const wastageAggr = [
        {
            '$lookup': {
              'from': 'canteens', 
              'localField': 'wastage_canteen_id', 
              'foreignField': '_id', 
              'as': 'canteen'
            }
          }, {
            '$lookup': {
              'from': 'machines', 
              'localField': 'wastage_machine_id', 
              'foreignField': '_id', 
              'as': 'machine'
            }
          }, {
            '$lookup': {
              'from': 'products', 
              'localField': 'wastage_product_id', 
              'foreignField': '_id', 
              'as': 'product'
            }
          }, {
            '$addFields': {
              'numCanteens': {
                '$size': '$canteen'
              }, 
              'numMachines': {
                '$size': '$machine'
              }, 
              'numProducts': {
                '$size': '$product'
              }
            }
          }, {
            '$match': {
              'numCanteens': {
                '$gt': 0
              }, 
              'numMachines': {
                '$gt': 0
              }, 
              'numProducts': {
                '$gt': 0
              }
            }
          }, {
            '$unwind': {
              'path': '$canteen', 
              'includeArrayIndex': 'string', 
              'preserveNullAndEmptyArrays': true
            }
          }, {
            '$unwind': {
              'path': '$machine', 
              'includeArrayIndex': 'string', 
              'preserveNullAndEmptyArrays': true
            }
          }, {
            '$unwind': {
              'path': '$product', 
              'includeArrayIndex': 'string', 
              'preserveNullAndEmptyArrays': true
            }
          }, {
            '$lookup': {
              'from': 'catagories', 
              'localField': 'product.product_catagory_id', 
              'foreignField': '_id', 
              'as': 'product_category'
            }
          }, {
            '$unwind': {
              'path': '$product_category', 
              'includeArrayIndex': 'string', 
              'preserveNullAndEmptyArrays': true
            }
          }, {
            '$unwind': {
              'path': '$canteen.canteen_company_ids', 
              'includeArrayIndex': 'string', 
              'preserveNullAndEmptyArrays': true
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'canteen.canteen_company_ids', 
              'foreignField': '_id', 
              'as': 'company'
            }
          }, {
            '$unwind': {
              'path': '$company', 
              'includeArrayIndex': 'string', 
              'preserveNullAndEmptyArrays': true
            }
          }
    ];

    const wastage = await wastageModel.aggregate(wastageAggr).exec();

    console.log('wastage', wastage);


    return res.json({
        success: true,
        // totalRecord: countWastage[0].wastage_product_id,
        // currentPage: currentPage,
        // totalPage: totalPage,
        data: wastage
    })
});

// exports.allWastage = asyncCatchHandler(async (req, res, next) => {

//     // const allWastageProduct=await pagination(wastageModel.find({}).populate('wastage_channel_id').populate('wastage_canteen_id').populate('wastage_product_id').populate('wastage_machine_id'),req)
//     const currentPage = Number(req.query.currentPage) || 1
//     const resultPerPage = Number(req.query.resultPerPage) || 10
//     const pagination = req.query.pagination || "true"

//     const skip = resultPerPage * (currentPage - 1);

//     const countWastage = await wastageModel.aggregate([
//         {
//             $match: {
//                 wastage_status: { $ne: 'Deleted' }
//             }
//         },
//         {
//             $group: {
//                 _id: {
//                     wastage_canteen_id: '$wastage_canteen_id',
//                     wastage_product_id: '$wastage_product_id'
//                 },
//                 product_quantity: {
//                     $sum: '$wastage_product_quantity'
//                 }
//             }
//         }, {
//             $project: {
//                 wastage_canteen_id: '$_id.wastage_canteen_id',
//                 wastage_product_id: '$_id.wastage_product_id',
//                 product_quantity: 1
//             }
//         }, {
//             $lookup: {
//                 from: 'canteens',
//                 localField: 'wastage_canteen_id',
//                 foreignField: '_id',
//                 as: 'wastage_canteen_id'
//             }
//         }, {
//             $lookup: {
//                 from: 'products',
//                 localField: 'wastage_product_id',
//                 foreignField: '_id',
//                 as: 'wastage_product_id'
//             }
//         }, {
//             $unwind: {
//                 path: '$wastage_product_id',
//                 preserveNullAndEmptyArrays: true
//             }
//         }, {
//             $unwind: {
//                 path: '$wastage_canteen_id',
//                 preserveNullAndEmptyArrays: true
//             }
//         }, {
//             $count: 'wastage_product_id'
//         }]);


//     let totalPage = Math.ceil(countWastage[0].wastage_product_id / resultPerPage)


//     const allWastageProduct = await wastageModel.aggregate([
//         {
//             $sort: {
//                 createdAt: -1
//             }
//         },
//         {
//             $match: {
//                 wastage_status: { $ne: 'Deleted' }
//             }
//         },
//         {
//             $group: {
//                 _id: {
//                     wastage_canteen_id: '$wastage_canteen_id',
//                     wastage_product_id: '$wastage_product_id'
//                 },
//                 product_quantity: {
//                     $sum: '$wastage_product_quantity'
//                 }
//             }
//         }, {
//             $project: {
//                 wastage_canteen_id: '$_id.wastage_canteen_id',
//                 wastage_product_id: '$_id.wastage_product_id',
//                 product_quantity: 1
//             }
//         }, {
//             $lookup: {
//                 from: 'canteens',
//                 localField: 'wastage_canteen_id',
//                 foreignField: '_id',
//                 as: 'wastage_canteen_id'
//             }
//         }, {
//             $lookup: {
//                 from: 'products',
//                 localField: 'wastage_product_id',
//                 foreignField: '_id',
//                 as: 'wastage_product_id'
//             }
//         }, {
//             $unwind: {
//                 path: '$wastage_product_id',
//                 preserveNullAndEmptyArrays: true
//             }
//         }, {
//             $unwind: {
//                 path: '$wastage_canteen_id',
//                 preserveNullAndEmptyArrays: true
//             }
//         }, {
//             $skip: skip
//         }, {
//             $limit: resultPerPage
//         }]);

//     return res.json({
//         success: true,
//         totalRecord: countWastage[0].wastage_product_id,
//         currentPage: currentPage,
//         totalPage: totalPage,
//         data: allWastageProduct
//     })
// })

exports.deleteWastage = asyncCatchHandler(async (req, res, next) => {
    const { wastage_id } = req.params
    const deleteWastage = await wastageModel.findOne({ _id: mongoose.Types.ObjectId(wastage_id) })

    if (!deleteWastage) {
        return next(new ErrorHandler(req.t("Wastage product not found"), 200));
    }
    deleteWastage ? deleteWastage.wastage_status = 'Deleted' : deleteWastage.wastage_status

    await deleteWastage.save()
    return res.json({
        success: true,
        message: req.t('Wastage Product is deleted successfully')
    })
})

exports.updateWastage = asyncCatchHandler(async (req, res, next) => {

    const { wastage_id } = req.params;
    const { wastage_canteen_id, wastage_machine_id, wastage_product_id, wastage_product_quantity, wastage_status } = req.body;


    if (wastage_product_quantity < 1) {
        return next(new ErrorHandler(req.t("Product quantity must be greater than 0"), 422));
    }
    const updateWastage = await wastageModel.findOne({ _id: mongoose.Types.ObjectId(wastage_id) })

    if (!updateWastage) {
        return next(new ErrorHandler(req.t("Wastage product not found"), 200));
    }
    wastage_canteen_id ? updateWastage.wastage_canteen_id = wastage_canteen_id : updateWastage.wastage_canteen_id
    wastage_machine_id ? updateWastage.wastage_machine_id = wastage_machine_id : updateWastage.wastage_machine_id
    wastage_product_id ? updateWastage.wastage_product_id = wastage_product_id : updateWastage.wastage_product_id
    wastage_product_quantity ? updateWastage.wastage_product_quantity = wastage_product_quantity : updateWastage.wastage_product_quantity
    wastage_status ? updateWastage.wastage_status = wastage_status : updateWastage.wastage_status

    await updateWastage.save()
    return res.json({
        success: true,
        message: req.t('Wastage Product is updated successfully'),
        data: updateWastage
    })
})

////

exports.wastageData = asyncCatchHandler(async (req, res, next) => {

    const data = await pagination(wastageModel.find({})
        .populate({ path: 'wastage_canteen_id', select: { canteen_name: 1, canteen_location: 1 } })
        .populate({ path: 'wastage_machine_id', select: { machine_name: 1 } })
        .populate({ path: 'wastage_product_id', select: { product_name: 1, product_image: 1 } })
        .populate({ path: 'wastage_channel_id', select: { channel_name: 1 } })
        .populate({ path: 'filler', select: { user_name: 1, user_email: 1 } }).sort({ createdAt: -1 }), req)
    return res.json({
        success: true,
        totalRecord: data?.totalRecord,
        currentPage: data?.currentPage,
        totalPage: data?.totalPage,
        data: data?.data
    })
})
