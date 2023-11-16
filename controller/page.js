const mongoose = require("mongoose");

const pageModel = require("../model/page");
const ErrorHandler = require("../utils/errorHandling");
const asyncCatchHandler = require("../middleware/catchAsyncError");
const pagination = require('../utils/pagination')
const filter = require('../utils/filter')
const { logs } = require('../utils/logs')

exports.addPage = asyncCatchHandler(async (req, res, next) => {
  const { title, status, description } = req.body;

  let model = await new pageModel({
    title,
    status,
    description,

  });
  const store = await model.save();
  await logs(null, null, null, null, null, null, null, null, null, null, null, store._id, null, null, "Add page", `${title} page has been added from ${req?.user?.user_name}`, req, res, next)

  res.status(200).json({
    success: true,
    message: req.t("Page is added successfully"),
    model,
  });
});

exports.allPage = asyncCatchHandler(async (req, res, next) => {
  // var host = req.headers['referer']; 

  let allPages
  if (req.query.filter) {
    allPages = await filter(pageModel.find({ status: { $ne: "Deleted" }, $or: [{ title: new RegExp(req.query.filter, 'i') }, { status: new RegExp(req.query.filter, 'i') }] })
      .sort({ createdAt: -1 }), req)
  } else {
    allPages = await pagination(pageModel.find({ status: { $ne: "Deleted" } })
      .sort({ createdAt: -1 }), req);
  }
  res.json({
    success: true,
    totalRecord: allPages.totalRecord,
    currentPage: allPages.currentPage,
    totalPage: allPages.totalPage,
    allPages: allPages.data,
  });
});

exports.deletePage = asyncCatchHandler(async (req, res, next) => {
  const id = req.params.id;

  const page = await pageModel.findOne({ _id: mongoose.Types.ObjectId(id) })

  if (!page) {
    return next(new ErrorHandler(req.t("Page not found"), 200));
  }
  page ? page.status = "Deleted" : ""
  await page.save();
  return res.json({
    success: true,
    message: req.t('Page is deleted successfully')
  })


});

exports.searchPage = asyncCatchHandler(async (req, res, next) => {
  const { id } = req.params;

  const searchData = await pageModel.findById(id);



  res.json({
    success: true,
    searchData,
  });
});
exports.updatePage = asyncCatchHandler(async (req, res, next) => {
  const { id } = req.params;

  const { title, description, status } = req.body;
  const page = await pageModel.findOne({ _id: mongoose.Types.ObjectId(id) });
  if (!page) {
    return next(new ErrorHandler(req.t("Page not found"), 200));
  }

  title ? (page.title = title) : title;
  description ? (page.description = description) : description;
  status ? (page.status = status) : status;

  page.save();
  res.json({
    success: true,
    message: req.t("Page is updated successfully"),
    page: page,
  });
});
