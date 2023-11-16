const mongoose = require('mongoose');
const {
  OrderModel
} = require('../model/order');
const ErrorHandler = require('../utils/errorHandling')
const asyncCatchError = require('../middleware/catchAsyncError')
const fs = require("fs");
const filter = require('../utils/filter')

var axios = require('axios').default

exports.getOrder = async (req, res, next) => {
  try {
    // const filter=req.query.filter
    // const data = await filter(OrderModel.find({})
    // .populate({ path: 'canteen_id', select: {canteen_name:1}})
    // .populate({ path: 'products.machine_id', select: {machine_name:1}})
    // .populate({ path: 'user_id', select: {user_name:1}})
    // .sort({ createdAt: -1 }), req)

    const currentPage = Number(req.query.currentPage) || 1
    var resultPerPage = Number(req.query.resultPerPage) || 10
    let filter = {}
    if (req.query.filter) {
      filter = {
        ...filter,
        'user_id.user_parent_id': mongoose.Types.ObjectId(req.query.filter)
      }
    }
    console.log("filter", filter)
    // const pagination = req.query.pagination || "true"

    const skip = resultPerPage * (currentPage - 1);
    const arr = [
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user_id'
        }
      }, {
        $unwind: {
          path: '$user_id',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $lookup: {
          from: 'canteens',
          localField: 'canteen_id',
          foreignField: '_id',
          as: 'canteen_id'
        }
      }, {
        $unwind: {
          path: '$canteen_id',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $lookup: {
          from: 'machines',
          localField: 'products.machine_id',
          foreignField: '_id',
          as: 'machine_id'
        }
      }, {
        $match: {
          ...filter
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id.user_parent_id',
          foreignField: '_id',
          as: 'company'
        }
      }, {
        $unwind: {
          path: '$company',
          preserveNullAndEmptyArrays: true
        }
      },]

    const data = await OrderModel.aggregate([...arr, {
      $skip: skip
    }, {
      $limit: resultPerPage
    }])
    const count = await OrderModel.aggregate([...arr, {
      $count: 'count'
    }])
    // const totalRecord = data?.length || 0
    let totalPage = Math.ceil(data?.length / resultPerPage) || 0
    return res.json({
      success: true,
      data: data,
      totalRecord: count[0]?.count || 0,
      currentPage: currentPage || 0,
      totalPage: totalPage || 0,

    })
  } catch (error) {

    return res.json({
      success: false,
      message: error.message

    })
  }
}

exports.refundPaymentOrders = async (req, res, next) => {
  try {
    // const data = await filter(OrderModel.find({ payment_status: 'REFUNDED' }).sort({ createdAt: -1 }), req)
    const currentPage = Number(req.query.currentPage) || 1
    var resultPerPage = Number(req.query.resultPerPage) || 10
    let filter = {}
    if (req.query.filter) {
      filter = {
        ...filter,
        'user_id.user_parent_id': mongoose.Types.ObjectId(req.query.filter)
      }
    }


    const skip = resultPerPage * (currentPage - 1);
    const arr = [
      {
        $sort: {
          createdAt: -1
        }
      }, {
        $match: {
          payment_status: 'REFUNDED'
        }
      }, {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user_id'
        }
      }, {
        $unwind: {
          path: '$user_id',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $lookup: {
          from: 'canteens',
          localField: 'canteen_id',
          foreignField: '_id',
          as: 'canteen_id'
        }
      }, {
        $unwind: {
          path: '$canteen_id',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $lookup: {
          from: 'machines',
          localField: 'products.machine_id',
          foreignField: '_id',
          as: 'machine_id'
        }
      }, {
        $match: {
          ...filter
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id.user_parent_id',
          foreignField: '_id',
          as: 'company'
        }
      }, {
        $unwind: {
          path: '$company',
          preserveNullAndEmptyArrays: true
        }
      }]

    const data = await OrderModel.aggregate([...arr, {
      $skip: skip
    }, {
      $limit: resultPerPage
    }])
    const count = await OrderModel.aggregate([...arr, {
      $count: 'count'
    }])
    // const totalRecord = data?.length || 0
    let totalPage = Math.ceil(data?.length / resultPerPage) || 0
    return res.json({
      success: true,
      data: data,
      totalRecord: count[0]?.count || 0,
      currentPage: currentPage || 0,
      totalPage: totalPage || 0,

    })
    // return res.json({
    //   success: true,
    //   data: data?.data,
    //   totalRecord: data?.totalRecord,
    //   currentPage: data?.currentPage,
    //   totalPage: data?.totalPage,

    // })
  } catch (error) {

    return res.json({
      success: false,
      message: error.message

    })
  }
}
exports.userOrders = asyncCatchError(async (req, res, next) => {
  const {
    id
  } = req.params;
  const userOrder = await OrderModel.find({
    user_id: mongoose.Types.ObjectId(id)
  }).sort({ createdAt: -1 })



  res.json({
    success: true,
    userOrder
  })
})

exports.deleteOrder = asyncCatchError(async (req, res, next) => {
  const {
    id
  } = req.params;
  const deleteOrder = await OrderModel.findByIdAndDelete(id);
  if (!deleteOrder) {
    return res.json({
      success: false,
      message: 'Order not found'
    })
  }
  res.json({
    success: true,
    message: 'Order is Deleted successfully'
  })
})

exports.refundPayment = asyncCatchError(async (req, res, next) => {
  const {
    orderId,
    userId,
    reason,
    amount
  } = req.body;

  const order = await OrderModel.findById(orderId);


  if (!order) {
    res.status(400);
    throw new Error('Order not found');
  }

  if (order.payment_status !== 'SALE') {
    res.status(400);
    throw new Error('Payment has not been completed');
  }

  if (!order.payment_method) {
    res.status(400);
    throw new Error('Order is not paid');
  }

  if (order.chargeAblePayment < amount) {
    res.status(400);
    throw new Error('Refund amount is greater than chargeable payment');
  }

  if (order.payment_method === 'stripe') {
    try {
      const refundPayments = await axios.post(`${process.env.STRIPE_SERVER}/api/v1/stripe/refund`, {
        payment_intent: order.paymentIntents,
        amount: amount * 100
      })

      const transaction = await axios.post(`${process.env.BASE_URL}/api/v1/transaction`, {
        userId: userId,
        orderId: orderId,
        reason: reason,
        amount: amount,
        status: 'success',
      })

      res.status(200).json({
        status: 'Stripe Payment Refund Success',
        data: refundPayments
      })
    } catch (error) {
      const transaction = await axios.post(`${process.env.BASE_URL}/api/v1/transaction`, {
        userId: userId,
        orderId: orderId,
        reason: reason,
        amount: amount,
        status: 'failed',
      })
      res.status(400).json({
        status: 'Stripe Payment Refund Failed',
        data: error
      })
    }
  } else if (order.payment_method === 'vipps') {

    try {
      const vippsAccessToken = await axios.get(`${process.env.VIPPS_SERVER}/get-vips-access-token`);
      if (vippsAccessToken.data.access_token) {
        const refundPayment = await axios.post(`${process.env.VIPPS_SERVER}/refund`, {
          "orderId": orderId,
          "amount": amount * 100,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Access-Token': `${vippsAccessToken.data.access_token}`
          }
        })

        const transaction = await axios.post(`${process.env.BASE_URL}/api/v1/transaction`, {
          userId: userId,
          orderId: orderId,
          reason: reason,
          amount: amount,
          status: 'success',
        })

        res.status(200).json({
          status: 'VIPPS Payment Refund Success',
          data: refundPayment
        })
      }
    } catch (error) {
      const transaction = await axios.post(`${process.env.BASE_URL}/api/v1/transaction`, {
        userId: userId,
        orderId: orderId,
        reason: reason,
        amount: amount,
        status: 'failed',
      })
      res.status(400).json({
        status: 'VIPPS Payment Refund Failed',
        data: error
      })
    }


  }
})