const res = require('express/lib/response');
const mongoose = require('mongoose');
const ErrorHandler = require('../utils/errorHandling')
const model = require('../model/logs');
const pagination = require('../utils/pagination')

exports.viewLogs = async (req, res, next) => {
  try {
    const data = await pagination(model.find().sort({createdAt:-1})
      .populate('canteen_id')
      .populate('machine_id')
      .populate('product_id')
      .populate('banner_id')
      .populate('user_id')
      .populate('wastage_id')
      .populate('channel_id')
      .populate('channel_id')
      .populate('subsidy_id')
      .populate('temperature_id')
      .populate('promotion_id')
      .populate('page_id')
      .populate('category_id')
      .populate('discount_id'), req);
      
      console.log('logs data',data);

    res.json({
      success: true,
      data: data?.data,
      totalRecord: data?.totalRecord,
      currentPage: data?.currentPage,
      totalPage: data?.totalPage,
    })
  }
  catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }

}