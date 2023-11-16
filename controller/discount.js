const mongoose = require("mongoose");

const model = require("../model/discount");
const machineModel = require("../model/verdering");
const canteenModel = require("../model/canteen");
const Channel = require("../model/channel");
const Product = require("../model/product");
const discountModel = require("../model/discount");
const AsyncCatchError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorHandling");
const moment = require('moment')
const userModel = require('../model/userModel')
const {
  discountUpdate
} = require("../email/emailMessage");
const pagination = require('../utils/pagination')
const filter = require('../utils/filter')
const { logs } = require('../utils/logs')


exports.addDiscount = async (req, res, next) => {
  let {
    discount_name,
    discount_type,
    discount_value,
    discount_end_date,
    discount_start_date,
    discount_product_id,

    discount_canteen_id
  } = req.body;
  const user = req.user
  let pirority_level

  if (discount_canteen_id && !discount_product_id && user.user_role == "super_admin") {
    pirority_level = 1
  }

  else if (!discount_canteen_id && !discount_product_id && user.user_role == "super_admin") {
    pirority_level = 2
  }
  else if (discount_canteen_id && discount_product_id && user.user_role == "super_admin") {
    pirority_level = 3
  }

  else if (!discount_canteen_id && discount_product_id && user.user_role == "super_admin") {
    pirority_level = 4
  }
  // Canteen Admin
  else if (discount_canteen_id && !discount_product_id && user.user_role == "canteen_admin") {
    pirority_level = 5
  }

  else if (discount_canteen_id && discount_product_id && user.user_role == "canteen_admin") {
    pirority_level = 6
  }

  const discount_owner = req.user ? req.user.user_role : ""

  let start_date = new Date(discount_start_date)
  let end_date = new Date(discount_end_date)
  let today = new Date()
  today = today.toISOString()
  today = today.substr(0, 10)

  if (discount_start_date < today) {
    return next(new ErrorHandler(req.t("Discount start date is not correct"), 422));
  }
  if (discount_end_date < today || discount_end_date < discount_start_date) {
    return next(new ErrorHandler(req.t("Discount end date is not correct"), 422));
  }

  if (discount_owner != 'canteen_admin' && discount_owner != "super_admin") {
    return next(new ErrorHandler(req.t("User don't have permission to create discount"), 422));
  }
  if (!discount_product_id && !discount_canteen_id && discount_owner != 'super_admin') {
    return next(new ErrorHandler(req.t("product or canteen  must be required"), 422));
  }
  if (!discount_product_id && !discount_canteen_id && discount_owner == 'super_admin') {
    const checkDiscount = await discountModel.
      findOne({ discount_canteen_id: null, discount_owner: discount_owner, discount_product_id: null, discount_status: 'Active' })
    if (checkDiscount) {
      return next(new ErrorHandler(req.t(`Discount is already created for all Cuboid by ${discount_owner}`), 200));
    }
  }
  // Validate discount against machine
  // if(discount_machine_id  && !discount_product_id){
  //   const checkDiscount=await discountModel.
  //   findOne({discount_machine_id:mongoose.Types.ObjectId(discount_machine_id),discount_owner:discount_owner,discount_product_id:null,discount_status:'Active'})
  // if(checkDiscount){
  //   return next(new ErrorHandler(`Discount is already created for this machine by ${discount_owner}`, 200)); 
  // }
  // }
  // Validate discount against canteen
  if (discount_canteen_id && !discount_product_id) {
    const checkDiscount = await discountModel.findOne({ discount_canteen_id: mongoose.Types.ObjectId(discount_canteen_id), discount_owner: discount_owner, discount_product_id: null, discount_status: 'Active' })
    if (checkDiscount) {
      return next(new ErrorHandler(req.t(`Discount is already created for this canteen by ${discount_owner}`), 200));
    }
  }
  // Validate discount is applied against product && canteen
  if (discount_canteen_id && discount_product_id) {
    const checkDiscount = await discountModel.findOne({ discount_canteen_id: mongoose.Types.ObjectId(discount_canteen_id), discount_owner: discount_owner, discount_product_id: mongoose.Types.ObjectId(discount_product_id), discount_status: 'Active' })
    if (checkDiscount) {
      return next(new ErrorHandler(req.t(`Discount is already created for this product against this canteen by ${discount_owner}`), 200));
    }
  }
  // Validate discount is applied against product && machine
  // if( discount_machine_id && discount_product_id ){
  //   const checkDiscount=await discountModel.findOne({discount_machine_id:mongoose.Types.ObjectId(discount_machine_id),discount_owner:discount_owner,discount_product_id:mongoose.Types.ObjectId(discount_product_id),discount_status:'Active'})
  // if(checkDiscount){
  //   return next(new ErrorHandler(`Discount is already created for this product against this machine by ${discount_owner}`, 200)); 
  // }
  // }
  /// Validate discount is applied against product lays for all machine
  if (!discount_canteen_id && discount_product_id && discount_owner == "super_admin") {

    const checkDiscount = await discountModel.findOne({ discount_canteen_id: null, discount_owner: discount_owner, discount_product_id: discount_product_id, discount_status: 'Active' })
    if (checkDiscount) {
      return next(new ErrorHandler(req.t(`Discount is already created for this product for all machines by ${discount_owner}`), 200));
    }
  }
  if (!discount_canteen_id && discount_product_id && discount_owner != 'super_admin') {

    return next(new ErrorHandler(req.t(`Please provide  canteen id for product discount`), 422));

  }

  const canteenCheck = discount_canteen_id ? await canteenModel.findOne({ _id: discount_canteen_id, canteen_status: 'Active' }) : ""
  if (discount_canteen_id && !canteenCheck) {
    return next(new ErrorHandler(req.t(`Canteen not found`), 200));
  }

  //   const machineCheck=discount_machine_id? await machineModel.findOne({_id:mongoose.Types.ObjectId(discount_machine_id),canteen_id:mongoose.Types.ObjectId(discount_canteen_id),machine_status:'Active'}):""

  //   if(discount_machine_id&&!machineCheck){
  //   return next(new ErrorHandler(`machine not found`, 404)); 
  // }

  const discount = await new discountModel({
    discount_name,
    discount_type,
    discount_owner,
    discount_value,
    discount_end_date,
    discount_start_date,
    discount_product_id: discount_product_id ? discount_product_id : null,

    discount_canteen_id: discount_canteen_id ? discount_canteen_id : null,
    pirority_level,
    discount_parent_id: req.user ? req.user._id : ""
  })

  const store = await discount.save()
  await logs(null, null, null, null, null, null, null, null, store._id, null, null, null, null, null, "Add discount", `${discount_name} discount has been added from ${req?.user?.user_name}`, req, res, next)

  const whiteList = await userModel.find({ user_status: 'Active', user_role: "white_list" })

  whiteList ? whiteList.forEach(data => {
    discountUpdate(data.user_name, data.user_email, discount_name, discount_value, discount_type)
  }) : ""
  return res.json({
    success: true,
    message: req.t('discount is created successfully'),
    data: discount
  })
};


exports.displayDiscount = AsyncCatchError(async (req, res, next) => {
  const d = new Date().toISOString()

  await model.updateMany({ discount_end_date: { $lt: d } }, { discount_status: 'InActive' })
  // const data = await model.find({discount_end_date:{$gt:d}}).count();
  let data = []
  if (req.user.user_role == 'super_admin') {
    if (req.query.filter) {
      data = await filter(model.find({
        $or: [{ discount_status: { $ne: "Deleted" }, discount_status: new RegExp(req.query.filter, 'i') },
        { discount_name: new RegExp(req.query.filter, 'i') }, { discount_type: new RegExp(req.query.filter, 'i') },

        ]
      }).populate('discount_canteen_id')
        .sort({ createdAt: -1 }), req)
    }
    else {
      data = await pagination(model.find({ discount_status: { $ne: "Deleted" } })
        .populate('discount_product_id')
        .populate('discount_canteen_id')
        .sort({ createdAt: -1 }), req);
    }
  } else {
    if (req.query.filter) {

      data = await filter(model.find({
        discount_status: { $ne: "Deleted" },
        discount_parent_id: mongoose.Types.ObjectId(req.user._id), $or: [
          { discount_status: new RegExp(req.query.filter, 'i') },
          { discount_name: new RegExp(req.query.filter, 'i') }, { discount_type: new RegExp(req.query.filter, 'i') },
        ]
      }).populate('discount_canteen_id').sort({ createdAt: -1 }), req)

    }
    else {

      data = await pagination(model.find({
        discount_status: { $ne: "Deleted" },
        discount_parent_id: mongoose.Types.ObjectId(req.user._id)
      }).populate('discount_product_id')
        .populate('discount_canteen_id').sort({ createdAt: -1 }), req);

    }
  }

  res.json({
    success: true,
    totalRecord: data.totalRecord,
    currentPage: data.currentPage,
    totalPage: data.totalPage,
    data: data.data

  });
});

exports.deleteDiscount = AsyncCatchError(async (req, res, next) => {
  const { id } = req.params;

  const deleteModel = await model.findOne({ _id: mongoose.Types.ObjectId(id) });
  if (!deleteModel) {
    return next(new ErrorHandler(req.t("Discount not found"), 200));
  }
  deleteModel ? deleteModel.discount_status = 'Deleted' : deleteModel.discount_status
  await deleteModel.save()

  return res.json({
    success: true,
    message: req.t("Discount is deleted successfully"),
  });
});

exports.searchDiscount = AsyncCatchError(async (req, res, next) => {
  const { id } = req.params;

  const search = await model.findOne({ _id: mongoose.Types.ObjectId(id) });


  res.json({
    success: true,
    search,
  });
});

exports.updateDiscount = AsyncCatchError(async (req, res, next) => {
  const {
    discount_name,
    discount_type,

    discount_value,
    discount_end_date,
    discount_start_date,
    discount_status

  } = req.body;

  const { id } = req.params;
  let start_date = new Date(discount_start_date)
  let end_date = new Date(discount_end_date)


  let today = new Date()
  today = today.toISOString()
  today = today.substr(0, 10)

  if (discount_start_date < today) {
    return next(new ErrorHandler(req.t("Discount start date is not correct"), 422));
  }
  if (discount_end_date < today || discount_end_date < discount_start_date) {
    return next(new ErrorHandler(req.t("Discount end date is not correct"), 422));
  }

  const data = await model.findOne({ _id: mongoose.Types.ObjectId(id) });

  if (!data) {
    return next(new ErrorHandler(req.t("Discount not found"), 200));
  }
  discount_name ? data.discount_name = discount_name : data.discount_name
  discount_type ? data.discount_type = discount_type : data.discount_type
  discount_value ? data.discount_value = discount_value : data.discount_value
  discount_end_date ? data.discount_end_date = discount_end_date : data.discount_end_date
  discount_start_date ? data.discount_start_date = discount_start_date : data.discount_start_date
  discount_status ? data.discount_status = discount_status : data.discount_status
  await data.save();

  res.json({
    success: true,
    message: req.t("Discount is updated successfully"),
    data,
  });
});

exports.subsidizing_products = AsyncCatchError(async (req, res, next) => {
  arr = [];

  const data = await model.find();

  for (let i = 0; i < data.length; i++) {
    arr.push(data[i].discount_productId);
  }
  const records = await Product.find({ _id: { $in: arr } });

  if (data.length < 1) {
    return next(new ErrorHandler("No discount fount", 422));
  }

  res.json({
    success: true,
    // data,
    records,
  });
});

function getProdcut(product_price, discount_value) {


  var numVal1 = Number(product_price);
  var numVal2 = Number(discount_value);

  var totalValue = numVal1 * ((100 - numVal2) / 100);
  // document.getElementById("total").value = totalValue.toFixed(2);



  return totalValue;
}
