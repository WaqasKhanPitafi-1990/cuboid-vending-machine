const mongoose = require("mongoose");
const promotion = require("../model/promotion");
const { body, validationResult } = require("express-validator");
const promotionModel = require("../model/promotion");
const ErrorHandler = require("../utils/errorHandling");
const { logs } = require("../utils/logs");
const asyncCatchHandler = require("../middleware/catchAsyncError");
const {
  promotionUpdate
} = require("../email/emailMessage");
const userModel = require("../model/userModel");
const pagination = require('../utils/pagination')
const filter = require('../utils/filter')


exports.addPromotions = asyncCatchHandler(async (req, res, next) => {

  let {
    promo_name,
    promo_code,
    promo_description,
    promo_start_date,
    promo_end_date,
    promo_type,
    promo_value,
    promo_productid,
    promo_status,
  } = req.body;
  // percentage ? (percentage = Number(percentage)) : "";

  const verifyCode = await promotionModel.findOne({ promo_code: promo_code, promo_status: 'Active' });

  if (verifyCode) {
    return res.json({
      success: false,
      message: req.t("This promotion code is already registered")
    })
  }
  // const applyInDate = new Date(promo_start_date).getTime() / 1000;
  // const expireInDate = new Date(promo_end_date).getTime() / 1000;
  const model = await new promotionModel({
    promo_name,
    promo_code,
    promo_description,
    promo_value,
    promo_type,
    promo_productid: promo_productid ? promo_productid : null,
    promo_status,
    promo_start_date,
    promo_end_date,
    promo_parent_id: req.user ? req.user._id : ""
  });
  // console.log("Discounttttttttttttttttttttttttttttt")
  const store = await model.save();
  await logs(null, null, null, null, null, null, null, null, null, null, null, null, store._id, null, "Add promotion", `${promo_name} promotion has been added from ${req?.user?.user_name}`, req, res, next)

  const whiteList = await userModel.find({ user_status: 'Active', user_role: "white_list" })

  whiteList ? whiteList.forEach(data => {
    promotionUpdate(data.user_name, data.user_email, promo_name, promo_code, promo_value, promo_type)
  }) : ""
  return res.json({
    success: true,
    message: req.t('Promotion is Added successfully')
  })

});

exports.allPromotions = asyncCatchHandler(async (req, res) => {
  let allPromotions
  let checkDate = new Date()
  checkDate = checkDate.toISOString().substr(0, 10)

  await promotionModel.updateMany({ promo_end_date: { $lt: checkDate } }, { promo_status: 'InActive' })
  if (req.user.user_role == 'super_admin') {
    if (req.query.filter) {
      allPromotions = await filter(promotionModel.find({ promo_status: { $ne: "Deleted" }, $or: [{ promo_status: new RegExp(req.query.filter, 'i') }, { promo_type: new RegExp(req.query.filter, 'i') }, { promo_name: new RegExp(req.query.filter, 'i') }, { promo_code: new RegExp(req.query.filter, 'i') }] })
        .sort({ createdAt: -1 }), req)
    } else {
      allPromotions = await pagination(promotionModel.find({ promo_status: { $ne: "Deleted" } })
        .sort({ createdAt: -1 }), req);
    }
  }
  else {
    if (req.query.filter) {
      allPromotions = await filter(promotionModel.find({ promo_status: { $ne: "Deleted" }, promo_parent_id: mongoose.Types.ObjectId(req.user._id), $or: [{ promo_status: new RegExp(req.query.filter, 'i') }, { promo_type: new RegExp(req.query.filter, 'i') }, { promo_name: new RegExp(req.query.filter, 'i') }, { promo_code: new RegExp(req.query.filter, 'i') }] })
        .sort({ createdAt: -1 }), req)
    } else {
      allPromotions = await pagination(promotionModel.find({ promo_status: { $ne: "Deleted" }, promo_parent_id: mongoose.Types.ObjectId(req.user._id) })
        .sort({ createdAt: -1 }), req);
    }
  }

  res.json({
    success: true,
    totalRecord: allPromotions.totalRecord,
    currentPage: allPromotions.currentPage,
    totalPage: allPromotions.totalPage,
    allPromotions: allPromotions.data,
  });
});

exports.deletePromotions = asyncCatchHandler(async (req, res, next) => {
  const id = req.params.id;

  const data = await promotionModel.findOne({ _id: mongoose.Types.ObjectId(id) })
  if (!data) {
    return next(new ErrorHandler(req.t("Promotion not found"), 200));
  }
  data ? data.promo_status = 'Deleted' : data.promo_status
  await data.save();
  return res.json({
    success: true,
    message: req.t("Promotion is deleted successfully"),
  });

});

exports.updatePromotions = asyncCatchHandler(async (req, res) => {
  const { id } = req.params;
  const {
    promo_name,

    promo_description,
    promo_start_date,
    promo_end_date,
    promo_type,
    promo_value,
    promo_productid,
    promo_status,
  } = req.body;

  const promotion = await promotionModel.findOne({ _id: mongoose.Types.ObjectId(id) });

  if (!promotion) {
    return res.json({
      success: false,
      messsage: req.t("Promotion not found"),
    });
  }


  let expireInDate = "";
  let applyInDate = "";
  // if (promo_end_date) {
  //   expireInDate = new Date(promo_end_date).getTime() / 1000;
  // }
  // if (promo_start_date) {
  //   applyInDate = new Date(promo_start_date).getTime() / 1000;
  // }
  promo_name ? (promotion.promo_name = promo_name) : promo_name;
  promo_value ? (promotion.promo_value = promo_value) : promo_value;
  promo_productid
    ? (promotion.promo_productid = promo_productid)
    : promo_productid;
  promo_status ? (promotion.promo_status = promo_status) : promo_status;

  promo_description
    ? (promotion.promo_description = promo_description)
    : promo_description;

  promo_type ? (promotion.promo_type = promo_type) : promo_type;
  promo_start_date
    ? (promotion.promo_start_date = promo_start_date)
    : promo_start_date;
  promo_end_date ? (promotion.promo_end_date = promo_end_date) : promo_end_date;

  promotion.save();

  return res.json({
    success: true,
    message: req.t("promotion is updated successfully"),
    promotion,
  });
});

exports.expirePromotions = asyncCatchHandler(async (req, res) => {
  let checkDate = new Date()
  checkDate = checkDate.toISOString().substr(0, 10)

  await promotionModel.updateMany({ promo_end_date: { $lt: checkDate } }, { promo_status: 'InActive' })

  return res.json({
    success: true,
    message: req.t('promotion status is updated successfully')
  })
})

