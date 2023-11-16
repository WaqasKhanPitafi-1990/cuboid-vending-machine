const mongoose = require("mongoose");
const ErrorHandler = require("../utils/errorHandling");
const machine_model = require("../model/verdering");
const canteen_model = require("../model/canteen");
const product_model = require("../model/product");
const pagination = require('../utils/pagination')

const channelModel = require('../model/channel')
const asyncCatchHandler = require("../middleware/catchAsyncError");
const model = require("../model/channel");
// const {allInventory1}=require('../routes/inventory')
// const machineModel = require("../model/verdering");


exports.allInventory1 = asyncCatchHandler(async (req, res, next) => {
  const { machine_id, canteen_id, product_id } = req.body;
  let { filter } = req.query

  let invenoty = ""
  let inventoryCount
  let filterData = {}
  if (filter) {
    filterData = {
      ...filterData,
      "product_name": new RegExp(filter, 'i')

    }
  }
  const currentPage = Number(req.query.currentPage) || 1
  var resultPerPage = Number(req.query.resultPerPage) || 10
  const pagination = req.query.pagination || "true"

  const skip = resultPerPage * (currentPage - 1);

  if (!machine_id && !canteen_id && !product_id) {

    await product_model.aggregate([
      {
        $match: {
          ...filterData,

        }
      },
      {
        $lookup: {
          from: 'channels',
          localField: '_id',
          foreignField: 'channel_product_id',
          as: 'string'
        }
      }, {
        $unwind: {
          path: '$string',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'catagories',
          localField: 'product_catagory_id',
          foreignField: '_id',
          as: 'category'
        }
      }, {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: {
            _id: '$_id',
            product_name: '$product_name',
            catagories_name: '$category.catagories_name',
            product_price: '$product_price',
            product_image: '$product_image'
          },
          TotalQuantity: {
            $sum: '$string.channel_product_quantity'
          }
        }
      }, {
        $project: {
          product_name: '$_id.product_name',
          catagories_name: '$_id.catagories_name',
          product_price: '$_id.product_price',
          product_image: '$_id.product_image',
          TotalQuantity: 1
        }
      }, {
        $project: {
          _id: 0
        }
      }])
    // let totalPage=Math.ceil(data/resultPerPage)
    invenntoryCount = await product_model.aggregate([
      {
        $match: {
          ...filterData,
          product_status: { $ne: 'Deleted' }
        }
      },
      {
        $lookup: {
          from: 'channels',
          localField: '_id',
          foreignField: 'channel_product_id',
          as: 'string'
        }
      }, {
        $unwind: {
          path: '$string',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'catagories',
          localField: 'product_catagory_id',
          foreignField: '_id',
          as: 'category'
        }
      }, {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: {
            _id: '$_id',
            product_name: '$product_name',
            catagories_name: '$category.catagories_name',
            product_price: '$product_price',
            product_image: '$product_image'
          },
          TotalQuantity: {
            $sum: '$string.channel_product_quantity'
          }
        }
      }, {
        $project: {
          product_name: '$_id.product_name',
          catagories_name: '$_id.catagories_name',
          product_price: '$_id.product_price',
          product_image: '$_id.product_image',
          TotalQuantity: 1
        }
      }, {
        $project: {
          _id: 0
        }
      }, {
        $count: 'product_name'
      }])

    let totalPage = Math.ceil(invenntoryCount[0]?.product_name / resultPerPage)

    invenoty = await product_model.aggregate([
      {
        $match: {
          ...filterData,
          product_status: { $ne: 'Deleted' }
        }
      },
      {
        $lookup: {
          from: 'channels',
          localField: '_id',
          foreignField: 'channel_product_id',
          as: 'string'
        }
      }, {
        $unwind: {
          path: '$string',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'catagories',
          localField: 'product_catagory_id',
          foreignField: '_id',
          as: 'category'
        }
      }, {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: {
            _id: '$_id',
            product_name: '$product_name',
            catagories_name: '$category.catagories_name',
            product_price: '$product_price',
            product_image: '$product_image'
          },
          TotalQuantity: {
            $sum: '$string.channel_product_quantity'
          }
        }
      }, {
        $project: {
          product_name: '$_id.product_name',
          catagories_name: '$_id.catagories_name',
          product_price: '$_id.product_price',
          product_image: '$_id.product_image',
          TotalQuantity: 1
        }
      }, {
        $project: {
          _id: 0
        }
      },
      {
        $sort: {
          TotalQuantity: -1
        }
      },
      {
        $skip: skip
      }, {
        $limit: resultPerPage
      }])

    return res.json({
      success: true,
      totalRecord: invenntoryCount[0]?.product_name ? invenntoryCount[0]?.product_name : 0,
      currentPage: currentPage,
      totalPage: totalPage ? totalPage : 0,
      data: invenoty,

    })
  }


  return res.json({
    success: false
  })
});


exports.addQuantity = asyncCatchHandler(async (req, res, next) => {
  const { channel_id, product_id } = req.params;
  const { channel_product_quantity } = req.body;
  if (!channel_product_quantity) {
    return next(new ErrorHandler("product quantity must be required", 422));
  }
  // const data = await model.findOne({ machine_id: machine_id })
  const channel = await model.findOne({
    _id: mongoose.Types.ObjectId(channel_id),
    channel_status: "Active",
  });
  if (!channel) {
    return next(new ErrorHandler("Channel not found", 200));
  }
  // console.log(product_id, channel.channel_product_id);
  if (channel.channel_product_id != product_id) {
    return next(new ErrorHandler("This channel has not this product", 200));
  }
  channel ? (channel.channel_product_quantity = channel.channel_product_quantity + channel_product_quantity) : channel.channel_product_quantity;

  await channel.save();
  return res.json({
    success: true,
    message: "Product quantity  updated successfully",
  });
});

/// Remove Product Quantity in Machine Channel

exports.removeQuantity = asyncCatchHandler(async (req, res, next) => {
  const { channel_id, product_id } = req.params;
  const { channel_product_quantity } = req.body;
  if (!channel_product_quantity) {
    return next(new ErrorHandler("product quantity must be required", 422));
  }
  // const data = await model.findOne({ machine_id: machine_id })
  const channel = await model.findOne({
    _id: mongoose.Types.ObjectId(channel_id),
    channel_status: "Active",
  });
  if (!channel) {
    return next(new ErrorHandler("Channel not found", 200));
  }

  if (channel.channel_product_id != product_id) {
    return next(new ErrorHandler("This channel has not this product", 422));
  }
  if (channel.channel_product_quantity < channel_product_quantity) {
    return next(new ErrorHandler("Product quantity is less in channel", 200));
  }
  channel
    ? (channel.channel_product_quantity =
      channel.channel_product_quantity - channel_product_quantity)
    : channel.channel_product_quantity;

  await channel.save();
  return res.json({
    success: true,
    message: "Product quantity removed successfully",
  });
});




