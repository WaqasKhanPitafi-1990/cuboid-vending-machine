const mongoose = require("mongoose");
const catagoryModel = require('../model/catagories')
const model = require("../model/product");
const channelModel = require("../model/channel");
const filter = require('../utils/filter')
const asyncCatchHandler = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorHandling");
const pagination = require('../utils/pagination')
const { logs } = require('../utils/logs');
exports.addProduct = asyncCatchHandler(async (req, res, next) => {

  const {
    product_name,
    product_price,
    product_description,
    product_VAT,
    product_catagory_id,
    product_expiry_date,
    product_status,
    product_gradient,
    dispensing_speed,
    product_recipes,
    product_allergies,
    product_number,
    product_max_limit,
    extraction_time
  } = req.body;



  // const verifyCatagories = await catagoryModel.findOne({ _id: mongoose.Types.ObjectId(product_catagory_id), catagories_status: 'Active' })

  // if (!verifyCatagories) {
  //   return next(new ErrorHandler(req.t("Category not found"), 200));
  // }

  const verifyProductNumber = await model.findOne({ product_number: product_number })

  if (verifyProductNumber) {
    return next(new ErrorHandler(req.t("Product with this product number is already added. please add new product number"), 200));
  }
  const productData = await new model({
    product_name,
    product_price,
    product_description,
    product_VAT,
    product_expiry_date,
    product_catagory_id,
    product_status,
    product_image: req.file ? process.env.BASE_URL + "/" + req.file.path : null,
    product_gradient,
    dispensing_speed,
    product_recipes,
    product_allergies,
    product_number,
    product_max_limit,
    extraction_time
  });

  const store = await productData.save();
  await logs(null, null, store._id, null, null, null, null, null, null, null, null, null, null, null, "Add product", `${product_name} product has been added from ${req?.user?.user_name}`, req, res, next)
  return res.json({
    success: true,
    message: req.t('Product is added successfully'),
    data: productData,
    language: JSON.parse(req.language)
  })

});

exports.allProduct = asyncCatchHandler(async (req, res, next) => {
  let product
  let f = {}
  if (req.query.category_id) {
    f = {
      ...f,
      product_catagory_id: req.query.category_id
    }
  }
  if (req.query.filter) {

    product = await filter(model.find({ ...f, product_status: { $ne: "Deleted" }, $or: [{ product_status: new RegExp(req.query.filter, 'i') }, { product_name: new RegExp(req.query.filter, 'i') }] }).populate('product_catagory_id')
      .sort({ createdAt: -1 }), req)
  } else {
    product = await pagination(model.find({ ...f, product_status: { $ne: "Deleted" } }).populate('product_catagory_id')
      .sort({ createdAt: -1 }), req)
  }
  return res.json({
    success: true,
    totalRecord: product.totalRecord,
    currentPage: product.currentPage,
    totalPage: product.totalPage,
    product: product.data,
  });
});

exports.deleteProduct = asyncCatchHandler(async (req, res, next) => {
  const id = req.params.id;

  const product = await model.findOneAndUpdate({ _id: mongoose.Types.ObjectId(id) }, {
    product_status: 'Deleted'
  });

  if (!product) {
    return next(new ErrorHandler(req.t("product not found"), 200));
  }

  res.json({
    success: true,
    message: req.t("Product is Deleted Successfully"),
  });
});
exports.updateProduct = asyncCatchHandler(async (req, res, next) => {
  const id = req.params.id;
  const {
    product_name,
    product_price,
    product_description,
    product_gradient,
    product_VAT,
    product_catagory_id,
    product_expiry_date,
    product_status,
    dispensing_speed,
    product_recipes,
    product_allergies,
    product_number,
    product_max_limit,
    extraction_time
  } = req.body;

  const product = await model.findOne({ _id: mongoose.Types.ObjectId(id) });
  if (!product) {
    return next(new ErrorHandler(req.t("product not found"), 200));
  }
  if (product_description && product_description.length > 300) {
    return next(new ErrorHandler(req.t("Product description must be less than 300 character"), 200));
  }
  if ((dispensing_speed != product.dispensing_speed) && (dispensing_speed < 0 || dispensing_speed > 19)) {
    return next(new ErrorHandler(req.t("Dispense speed must be bewteen 0 to 19"), 422));
  }
  const verifyProductNumber = await model.findOne({ _id: { $ne: mongoose.Types.ObjectId(id) }, product_number: product_number })

  if (verifyProductNumber) {
    return next(new ErrorHandler(req.t("Product with this product number is already added. please add new product number"), 200));
  }
  if (product.product_max_limit != product_max_limit) {
    await channelModel.updateMany({ channel_product_id: mongoose.Types.ObjectId(id) }, { channel_product_limit: product_max_limit })
  }
  product_name ? (product.product_name = product_name) : product_name;
  product_price ? (product.product_price = product_price) : product_price;
  product_description ? (product.product_description = product_description) : product_description;
  product_gradient ? product.product_gradient = product_gradient : product.product_gradient
  req.file ? (product.product_image = process.env.BASE_URL + "/" + req.file.path) : product.product_image;
  product_VAT ? (product.product_VAT = product_VAT) : product_VAT;
  product_catagory_id && product_catagory_id?.length > 0 ? (product.product_catagory_id = product_catagory_id) : product_catagory_id;
  product_expiry_date ? (product.product_expiry_date = product_expiry_date) : product_expiry_date;
  product_status ? product.product_status = product_status : product_status;
  dispensing_speed ? product.dispensing_speed = +dispensing_speed : dispensing_speed
  product_allergies ? product.product_allergies = product_allergies : product_allergies
  product_recipes ? product.product_recipes = product_recipes : product_recipes
  product_number ? product.product_number = product_number : product_number,
  product_max_limit ? product.product_max_limit = product_max_limit : product_max_limit,
  extraction_time ? product.extraction_time = extraction_time : extraction_time


    await product.save();

  return res.json({
    success: true,
    message: req.t("product is updated successfully"),
    product,
  });
});

// Notice
exports.addImage = asyncCatchHandler(async (req, res, next) => {
  const { id } = req.params;
  let fileArray = [];
  req.files.forEach((element) => {
    // const file = element.originalname

    fileArray.push(element.originalname);
  });
  // console.log(fileArray, "FileArray")
  const image = req.files.originalname;
  const productModel = await model.findByIdAndUpdate(id, {
    image: fileArray,
  });

  productModel.save();

  res.json({
    data: req.files,
    imgData: fileArray,
  });
});


exports.addBulkProduct = async (req, res, next) => {
  try {
    let { data } = req.body
    let message = "all products have been added successfully";
    let success = true
    let unique = []


    for (let i = 0; i < data?.length; i++) {
      // async () => {
      const verifyProductNumber = await model.findOne({ product_number: data[i].product_number })

      if (!verifyProductNumber) {
        const checkCatregory = await catagoryModel.findOne({ catagories_name: data[i]?.category_name })

        if (checkCatregory) { // Check if category is already exist
          const modelData = await new model({
            ...data[i],
            product_catagory_id: [checkCatregory?._id]
          })
          const pdata1 = await modelData.save()
          await logs(null, null, pdata1._id, null, null, null, null, null, null, null, null, null, null, null, "Add product", `${data[i]?.product_name} product, has been added from ${req?.user?.user_name}`, req, res, next)

        }
        else {
          const categoryData = await new catagoryModel({
            catagories_name: data[i].category_name
          })
          const ca = await categoryData.save()

          await logs(null, null, null, null, ca._id, null, null, null, null, null, null, null, null, null, "Add category", `${data[i]?.category_name} category, has been added from ${req?.user?.user_name}`, req, res, next)

          const modelData = await new model({
            ...data[i],
            product_catagory_id: categoryData?._id,
          })
          const pdata = await modelData.save()
          await logs(null, null, pdata._id, null, null, null, null, null, null, null, null, null, null, null, "Add product", `${data[i]?.product_name} product, has been added from ${req?.user?.user_name}`, req, res, next)

        }
      } else {
        unique.push(data[i])
      }
    }
    // }
    if (unique?.length > 0) {
      if (unique?.length == data?.length) {
        message = "no product is added due to unique product number",
          success = false
      } else {
        message = "some of product is not added due to unique product number",
          success = true
      }
    }
    res.json({
      success: success,
      message: message,
      dublicate: unique,
    });

  }
  catch (err) {
    return res.json({
      success: false,
      message: err.message
    })
  }
}
