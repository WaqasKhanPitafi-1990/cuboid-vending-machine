const mongoose = require("mongoose");
const canteenModel = require('../model/canteen')
const model = require("../model/product");
const pagination = require('../utils/pagination')
const asyncCatchHandler = require("../middleware/catchAsyncError");
const filter = require('../utils/filter')
exports.addProductVend = async (req, res, next) => {
  try {
    const { product_vend_limit, canteen_id } = req.body

    const canteen = await canteenModel.findOne({ _id: mongoose.Types.ObjectId(canteen_id) })
    if (!canteen) {
      return res.json({
        success: false,
        message: 'canteen not found',
        data: {}
      })
    }
    canteen ? canteen.product_vend_limit = product_vend_limit : ""
    await canteen.save()
    return res.json({
      success: true,
      message: 'Product vend limit has been applied successfully'
    })
  }
  catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}

exports.getVend = async (req, res, next) => {
  try {
    const { canteen_id } = req.params

    const canteen = await canteenModel.findOne({ _id: mongoose.Types.ObjectId(canteen_id) }).select({ canteen_name: 1, product_vend_limit: 1 })

    return res.json({
      success: true,
      data: canteen
    })
  }
  catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}

exports.vendListing = async (req, res, next) => {
  try {
    const canteen = await pagination(canteenModel.find({}).select({ canteen_name: 1, product_vend_limit: 1 })
      .sort({ createdAt: -1 }), req)

    return res.json({
      success: true,
      totalRecord: canteen.totalRecord,
      currentPage: canteen.currentPage,
      totalPage: canteen.totalPage,
      data: canteen.data
    })
  }
  catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}

exports.deleteVendLimit = async (req, res, next) => {
  try {
    const { canteen_id } = req.params

    const canteen = await canteenModel.findOne({ _id: mongoose.Types.ObjectId(canteen_id) }).select({ canteen_name: 1, product_vend_limit: 1 })
    if (!canteen) {
      return res.json({
        success: false,
        message: 'Canteen not found'
      })
    }
    canteen ? canteen.product_vend_limit = 0 : ''
    await canteen.save()
    return res.json({
      success: true,
      message: 'product vend limit is deleted successfully'
    })
  }
  catch (err) {
    return res.status(202).json({
      success: false,
      error: err,
      message: err.message
    })
  }
}

exports.updateVendLimit = async (req, res, next) => {
  try {
    const { canteen_id } = req.params
    const { product_vend_limit } = req.body
    const canteen = await canteenModel.findOne({ _id: mongoose.Types.ObjectId(canteen_id) })
      .select({ canteen_name: 1, product_vend_limit: 1 })
    if (!canteen) {
      return res.json({
        success: false,
        message: 'Canteen not found'
      })
    }
    product_vend_limit ? canteen.product_vend_limit = product_vend_limit : ''
    await canteen.save()
    return res.json({
      success: true,
      message: 'product vend limit is updated successfully'
    })
  }
  catch (err) {
    return res.status(202).json({
      success: false,
      error: err,
      message: err.message
    })
  }
}
