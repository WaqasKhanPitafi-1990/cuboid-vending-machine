// addWhiteList, displayWhiteList,deleteWhiteList, updateWhiteList
const mongoose = require('mongoose');
const {
  OrderModel
} = require('../model/order');
const pagination = require('../utils/pagination')

const productModel = require('../model/product')
const filter = require('../utils/filter');
const canteen = require('../model/canteen');
const ErrorHandler = require('../utils/errorHandling')
const asyncCatchError = require('../middleware/catchAsyncError')
const events = require('../model/events');
const categories = require('../model/catagories');
const {
  differenceDateTimeText,
  differenceDateTimeNumerical,
  differenceDateTimeNumericalSecondsToText,
  monthNames
} = require('../utils/utils');
const machineModel = require('../model/verdering');
const { roundedRect } = require('pdfkit');
const wastage = require('../model/wastage');

exports.getCanteenLocations = async (req, res, next) => {
  let locations = await canteen.find().select('canteen_location').distinct('canteen_location');

  const response = {
    success: true,
    data: locations
  };
  return res.send(response);
};

exports.getAllProductCategories = async (req, res, next) => {
  let product_categories = await categories.find().select('catagories_name').distinct('catagories_name');
  const response = {
    success: true,
    data: product_categories
  };
  return res.send(response);

};

exports.getCanteens = async (req, res, next) => {
  let canteen_names = await canteen.find().select('canteen_name').distinct('canteen_name');
  // console.log('canteen_names', canteen_names);
  const response = {
    success: true,
    data: canteen_names
  };
  return res.send(response);
};

exports.getTransactionsLogReport = asyncCatchError(async (req, res, next) => {
  let data = [];
  // console.log(req.query);
  const { payment_method, canteen_name, from, to, location, sort, resultPerPage, currentPage, pagination, vat, machine } = req.query;
  let transactions;
  let summaryArray;
  let totalRecords = 0;
  if (canteen_name && payment_method && from && to && location) {
    const agg = [
      {
        '$lookup': {
          'from': 'canteens',
          'localField': 'canteen_id',
          'foreignField': '_id',
          'as': 'canteens'
        }
      },
      {
        '$unwind': {
          'path': '$canteens',
          'includeArrayIndex': 'string',
          'preserveNullAndEmptyArrays': true
        }
      },
      {
        '$unwind': {
          'path': '$products',
          'includeArrayIndex': 'string',
          'preserveNullAndEmptyArrays': true
        }
      },
      {
        '$match': {
          'createdAt': {
            '$gte': new Date(from),
            '$lte': new Date(to)
          }
        }
      },
      {
        '$sort': {
          'createdAt': sort === 'asc' ? 1 : -1
        }
      },
      {
        '$project': {
          product_name: '$products.product_name',
          quantity: '$products.product_quantity',
          price: '$products.product_price',
          type: '$payment_method',
          product_vat: '$products.product_VAT',
          product_discount: '$products.per_product_discount',
          order_status: '$order_status',
          machine_id: '$products.machine_id',
          subsidy_points: '$subsidy_points',
          chargeable_payment: '$chargeAblePayment',
          discount: '$discount',
          created_at: '$createdAt',
          discount_type: '$products.discount_type',
          products: 1,
          vat_percentage: '$products.vat_percentage',
          product_delivery_status: '$products.deliveryStatusList',
          payment_status: 1
        }
      },
      {
        '$lookup': {
          'from': 'machines',
          'localField': 'machine_id',
          'foreignField': '_id',
          'as': 'machine'
        }
      },
      {
        '$unwind': {
          'path': '$machine',
          'includeArrayIndex': 'string',
          'preserveNullAndEmptyArrays': true
        }
      },
      {
        '$addFields': {
          'price_with_vat': {
            '$add': ['$price', '$product_vat']
          }
        }
      },
      {
        '$project': {
          machine_name: '$machine.machine_name',
          product_name: '$product_name',
          quantity: '$quantity',
          type: '$type',
          price_without_vat: '$price',
          price_with_vat: '$price_with_vat',
          product_discount: '$product_discount',
          product_vat: '$product_vat',
          order_status: '$order_status',
          subsidy_points: '$subsidy_points',
          chargeable_payment: '$chargeable_payment',
          discount: '$discount',
          created_at: '$created_at',
          discount_type: 1,
          vat_percentage: 1,
          products: 1,
          product_delivery_status: 1,
          priceWithoutVAT: 1,
          payment_status: 1
        }
      },
      {
        $sort: {
          created_at: -1
        }
      }
    ];

    if (canteen_name.toLowerCase() !== 'all') {
      agg[3]['$match']['canteens.canteen_name'] = { '$eq': canteen_name };
    }

    if (location.toLowerCase() !== 'all') {
      agg[3]['$match']['canteens.canteen_location'] = { '$eq': location };
    }

    if (payment_method.toLowerCase() !== 'all') {
      agg[3]['$match']['payment_method'] = { '$eq': payment_method };
    }

    agg.push({
      '$addFields': {
        'vat_percent': {
          '$divide': [
            '$price_without_vat', '$product_vat'
          ]
        }
      }
    });

    if (vat.toLowerCase() === 'with') {
      //options: with, without
      agg.push(
        {
          '$project': {
            machine_name: '$machine_name',
            product_name: '$product_name',
            quantity: '$quantity',
            price: '$price_with_vat',
            type: '$type',
            vat_percent: '$vat_percent',
            order_status: '$order_status',
            product_discount: '$product_discount',
            product_vat: '$product_vat',
            subsidy_points: '$subsidy_points',
            chargeable_payment: '$chargeable_payment',
            discount: '$discount',
            created_at: '$created_at',
            discount_type: 1,
            products: 1,
            vat_percentage: 1,
            product_delivery_status: 1,
            priceWithoutVAT: 1,
            payment_status: 1
          }
        }
      );
    } else {
      agg.push(
        {
          '$project': {
            machine_name: '$machine_name',
            product_name: '$product_name',
            quantity: '$quantity',
            price: '$price_without_vat',
            type: '$type',
            vat_percent: '$vat_percent',
            order_status: '$order_status',
            product_discount: '$product_discount',
            product_vat: '$product_vat',
            subsidy_points: '$subsidy_points',
            chargeable_payment: '$chargeable_payment',
            discount: '$discount',
            created_at: '$created_at',
            discount_type: 1,
            products: 1,
            vat_percentage: 1,
            product_delivery_status: 1,
            priceWithoutVAT: 1,
            payment_status: 1
          }
        }
      );
    }

    if (machine.toLowerCase() !== 'all') {
      agg.push({
        '$match': {
          'machine_name': {
            '$eq': machine
          }
        }
      });

    }

    transactions = await OrderModel.aggregate(agg).exec();
    totalRecords = transactions.length;
    const types = [];
    let totalSalesAmount = 0;
    let totalVatAmount = 0;
    transactions.forEach(tr => {
      if (!types.find(type => type.type === tr.type)) {
        const obj = { type: tr.type, amount: 0, quantity: 0, vat_percent: 'N/A' };
        types.push(obj);
      }
      totalSalesAmount += ((tr?.price || 0) - (tr?.product_discount || 0));
      totalVatAmount += (tr?.product_vat || 0);
    });

    transactions.forEach(tr => {
      const type = types.find(type => type.type === tr.type);
      if (type) {
        type.amount += ((tr?.price || 0) - (tr?.product_discount || 0));
        type.quantity += 1;
      }
    });

    summaryArray = [...types];
    if (vat.toLowerCase() === 'with') {
      summaryArray.push({ type: 'Total VAT', quantity: transactions.length, amount: totalVatAmount, vat_percent: (totalVatAmount / totalSalesAmount) * 100 });
    }
    summaryArray.push({ type: 'Total Sales', quantity: transactions.length, amount: totalSalesAmount, vat_percent: 'N/A' });

    if (pagination && resultPerPage && currentPage) {
      const skip = (Number(resultPerPage) || 10) * ((Number(currentPage) - 1 || 0));
      agg.push(
        {
          '$skip': skip
        });
      agg.push(
        {
          '$limit': Number(resultPerPage) || 10
        });
    }
    transactions = await OrderModel.aggregate(agg).exec();

  } else {
    const response = {
      success: false,
      data: {
        error: 'Filters not given'
      }
    };
    return res.send(response);
  }

  let totalPage = Math.ceil(totalRecords / Number(resultPerPage))
  const response = {
    success: true,
    data: transactions,
    summary: summaryArray,
    totalRecord: totalRecords,
    currentPage: Number(currentPage),
    totalPage: totalPage
  };
  return res.send(response);

});

exports.getDowntimes = asyncCatchError(async (req, res, next) => {
  const { resultPerPage, currentPage, pagination, from, to } = req.query;
  let data = [];
  const agg = [
    {
      '$sort': {
        'createdAt': 1
      }
    },
    {
      '$lookup': {
        'from': 'canteens',
        'localField': 'canteen_id',
        'foreignField': '_id',
        'as': 'canteens'
      }
    },
    {
      '$unwind': {
        'path': '$canteens',
        'includeArrayIndex': 'string',
        'preserveNullAndEmptyArrays': true
      }
    },
    {
      '$project': {
        'canteen_id': '$canteens._id',
        'canteen_name': '$canteens.canteen_name',
        'machine_number': '$machine_number',
        'status_of_event': '$status_of_event',
        'event': '$event',
        'createdAt': '$createdAt'
      }
    },
    {
      '$match': {
        'createdAt': {
          '$gte': new Date(from),
          '$lte': new Date(to)
        }
      }
    }
  ];
  const result = await events.aggregate(agg).exec();
  const canteens = [];
  const machines = [];

  result.forEach((r, i) => {
    if (!canteens.find(obj => obj.canteen_name === r.canteen_name)) {
      canteens.push({
        canteen_name: r.canteen_name,
        machines: []
      });
    }

    const canteen = canteens.find(obj => obj.canteen_name === r.canteen_name);
    if (canteen) {
      !canteen.machines.find(m => m.machine_number === r.machine_number) && canteen.machines.push({ machine_number: r.machine_number, events: [] });
      const machine = canteen.machines.find(m => m.machine_number === r.machine_number);
      const event = r.event.includes('Machine 201 Event Machine Communication Status') ? r.event.split(',')[0].split(':')[1].trim() : r.event;
      const eventObj = machine.events.find(e => e.event === event);
      if (eventObj) {
        eventObj['duration_text'] = r.status_of_event === 'Device OK' ? differenceDateTimeText(new Date(eventObj.createdAt).getTime(), new Date(r.createdAt).getTime()) : differenceDateTimeText(new Date(r.createdAt).getTime(), new Date().getTime());
        eventObj['duration_seconds'] = r.status_of_event === 'Device OK' ? differenceDateTimeNumerical(new Date(eventObj.createdAt).getTime(), new Date(r.createdAt).getTime()) : differenceDateTimeNumerical(new Date(r.createdAt).getTime(), new Date().getTime());
        eventObj['createdAt'] = r.createdAt;
        eventObj['status_of_event'] = r.status_of_event;
      } else {
        machine.events.push({
          duration_text: differenceDateTimeText(new Date(r.createdAt).getTime(), new Date().getTime()),
          duration_seconds: differenceDateTimeNumerical(new Date(r.createdAt).getTime(), new Date().getTime()),
          createdAt: r.createdAt,
          event,
          status_of_event: r.status_of_event,
        });
      }
    }
  });

  let summary = [];
  let eventsFlattenedOut = [];
  let i = 0;
  let j = 0;
  const skip = Number(resultPerPage) * (Number(currentPage) - 1);
  // console.log('skip', skip);
  canteens.forEach(ca => {
    // console.log(ca);
    ca.machines.forEach(ma => {
      ma.events.forEach(ev => {
        if (j >= skip) {
          if (i < Number(resultPerPage)) {
            eventsFlattenedOut.push({
              machine_name: `${ca.canteen_name} Machine ${ma.machine_number}`,
              duration_text: ev.duration_text,
              duration_seconds: ev.duration_seconds,
              created_at: ev.createdAt,
              ended_at: ev.status_of_event === 'Device OK' ? new Date(new Date(ev.createdAt).getTime() + ev.duration_seconds * 1000) : '',
              event: ev.event,
              status: ev.status_of_event
            });
            const summaryObj = summary.find(s => s.event === ev.event);
            if (!summaryObj) {
              summary.push({
                event: ev.event,
                duration_seconds: ev.duration_seconds
              });
            } else {
              summaryObj.duration_seconds += ev.duration_seconds;
            }
          }
          i = i + 1;

        }
        j = j + 1;

      });
    });

  });

  // console.log(summary);

  summary = summary.map(summ => {
    summ.duration_text = differenceDateTimeNumericalSecondsToText(summ.duration_seconds);
    return summ;
  });

  let totalPage = Math.ceil(eventsFlattenedOut.length / Number(resultPerPage))
  const response = {
    success: true,
    data: eventsFlattenedOut,
    summary,
    totalRecord: eventsFlattenedOut.length,
    currentPage: Number(currentPage),
    totalPage: totalPage
  };
  return res.send(response);

});

// CVM-400
exports.saleReports = async (req, res, next) => {
  try {
    let filter = {}
    let { from, to, machine, product, location } = req.query

    if (from && to) {

      filter = {
        ...filter,
        $and: [
          { createdAt: { $lte: new Date(to) } },
          { createdAt: { $gte: new Date(from) } },
        ]
      }


    }

    if (machine && machine != "all") {
      filter = {
        ...filter,
        "machine.machine_name": machine,
      }
    }

    if (product && product != "all") {
      filter = {
        ...filter,
        "products.product_name": product,
      }
    }
    if (location && location != "all") {
      filter = {
        ...filter,
        "machine.machine_location": location
      }
    }
    var quantity = 0
    var totalVAT = 0
    let event = []

    event = await OrderModel.aggregate([
      {
        $match: {
          payment_status: {
            '$in': ['SALE', 'CAPTURE']
          }
        }
      },
      {
        $unwind: {
          path: '$products',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'product'
        }
      }, {
        $unwind: {
          path: '$product',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $lookup: {
          from: 'machines',
          localField: 'products.machine_id',
          foreignField: '_id',
          as: 'machine'
        }
      }, {
        $unwind: {
          path: '$machine',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $match: {

          ...filter
        }
      }, {
        $project: {
          products: 1,
          product: 1,
          VAT: '$products.vat_percentage',
          price_with_VAT: {
            $multiply: [
              {
                $subtract: [{
                  $sum: [
                    {
                      $divide: [
                        {
                          $multiply: [
                            '$products.vat_percentage',
                            '$products.product_price'
                          ]
                        },
                        100
                      ]
                    },
                    '$products.product_price'
                  ]
                }, '$products.per_product_discount']
              },
              '$products.product_quantity'
            ]
          },
          machine: '$machine'
        }
      }, {
        $group: {
          _id: '$product._id',
          VAT: {
            $first: '$VAT'
          },
          machine: {
            $first: '$machine'
          },
          product: {
            $first: '$product'
          },
          products: {
            $first: '$products'
          },
          product_quantity: {
            $sum: '$products.product_quantity'
          },
          price_with_VAT: {
            $sum: '$price_with_VAT'
          }
        }
      }, {
        $project: {
          _id: '$_id._id',
          VAT: '$VAT',
          machine: '$machine.machine_name',
          products: '$_id.data.products',
          product: '$products.product_name',
          product_quantity: '$product_quantity',
          price_with_VAT: 1
        }
      }])

    for (let i = 0; i < event?.length; i++) {
      // console.log(event[i].price_with_VAT, event[i].product_quantity)
      quantity = quantity + event[i].product_quantity
      totalVAT = Number(totalVAT) + Number(event[i].price_with_VAT)
    }
    return res.status(200).json({
      success: true,
      data: event,
      totalQuantity: quantity,
      totalVAT: totalVAT
    })

  }

  catch (error) {
    return res.json({
      success: false,
      message: error.message,
      error
    })
  }
}

// CVM-403
exports.salesReportsByMachine = async (req, res, next) => {

  try {
    let data
    let filter = {}
    let { from, to, machine, product, location } = req.query
    const currentPage = Number(req.query.currentPage) || 1
    const resultPerPage = Number(req.query.resultPerPage) || 10
    const pagination = req.query.pagination || "true"

    const skip = resultPerPage * (currentPage - 1);
    // console.log(skip, "skip")
    if (from && to) {

      filter = {
        ...filter,
        $and: [
          { createdAt: { $lte: new Date(to) } },
          { createdAt: { $gte: new Date(from) } },
        ]
      }


    }

    if (machine && machine != "all") {
      filter = {
        ...filter,
        "machine.machine_name": machine,
      }
    }

    if (product && product != "all") {
      filter = {
        ...filter,
        "products.product_name": product,
      }
    }
    if (location && location != "all") {
      filter = {
        ...filter,
        "machine.machine_location": location
      }
    }
    let countRecord = await OrderModel.aggregate([
      {
        $match: {
          payment_status: 'SALE'
        }
      },
      {
        $unwind: {
          path: '$products',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'product'
        }
      }, {
        $unwind: {
          path: '$product',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $lookup: {
          from: 'machines',
          localField: 'products.machine_id',
          foreignField: '_id',
          as: 'machine'
        }
      }, {
        $unwind: {
          path: '$machine',
          preserveNullAndEmptyArrays: false
        }
      }, {
        $lookup: {
          from: 'canteens',
          localField: 'canteen_id',
          foreignField: '_id',
          as: 'canteen'
        }
      }, {
        $unwind: {
          path: '$canteen',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $match: {
          ...filter
        }
      }, {
        $project: {
          products: 1,
          product: 1,
          VAT: '$products.vat_percentage',
          withoutVAT: { $multiply: ['$products.product_price', '$products.product_quantity'] },
          price_with_VAT: {
            $multiply: [
              {

                $sum: [
                  {
                    $divide: [
                      {
                        $multiply: [
                          '$products.vat_percentage',
                          '$products.product_price'
                        ]

                      },
                      100
                    ]
                  },
                  '$products.product_price'
                ],

              },
              '$products.product_quantity'
            ]
          },
          machine: '$machine'
        },

      }, {
        $group: {
          _id: '$product._id',
          VAT: {
            $first: '$VAT'
          },
          product: {
            $first: '$product'
          },
          price_without_VAT: {
            $sum: '$withoutVAT',
          },
          products: {
            $first: '$products'
          },
          machine: {
            $first: '$machine'
          },
          product_quantity: {
            $sum: '$products.product_quantity'
          },
          price_with_VAT: {
            $sum: '$price_with_VAT'
          },

        }
      }, {
        $group: {
          _id: '$machine._id',
          totalQuantity: {
            $sum: '$product_quantity'
          },
          totalPriceWithVAT: {
            $sum: '$price_with_VAT'
          },
          totalPriceWithoutVAT: { $sum: '$price_without_VAT' },
          machine: {
            $first: '$machine.machine_name'
          },
          data: {
            $push: {
              product: '$products.product_name',
              products: '$products',
              VAT: '$VAT',
              price_with_VAT: '$price_with_VAT',
              price_without_VAT: '$price_without_VAT',
              product_quantity: '$product_quantity'
            }
          }
        },

      },
      {
        $count: "record"
      }

    ])
    data = await OrderModel.aggregate([
      {
        $match: {
          payment_status: 'SALE'
        }
      },
      {
        $unwind: {
          path: '$products',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'product'
        }
      }, {
        $unwind: {
          path: '$product',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $lookup: {
          from: 'machines',
          localField: 'products.machine_id',
          foreignField: '_id',
          as: 'machine'
        }
      }, {
        $unwind: {
          path: '$machine',
          preserveNullAndEmptyArrays: false
        }
      }, {
        $lookup: {
          from: 'canteens',
          localField: 'canteen_id',
          foreignField: '_id',
          as: 'canteen'
        }
      }, {
        $unwind: {
          path: '$canteen',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $match: {
          ...filter
        }
      }, {
        $project: {
          products: 1,
          product: 1,
          VAT: '$products.vat_percentage',
          withoutVAT: { $multiply: ['$products.product_price', '$products.product_quantity'] },
          price_with_VAT: {
            $multiply: [
              {
                $subtract: [{
                  $sum: [
                    {
                      $divide: [
                        {
                          $multiply: [
                            '$products.vat_percentage',
                            '$products.product_price'
                          ]
                        },
                        100
                      ]
                    },
                    '$products.product_price'
                  ]
                }
                  , '$products.per_product_discount']
              },
              '$products.product_quantity'
            ]
          },
          machine: '$machine'
        },

      }, {
        $group: {
          _id: '$product._id',
          VAT: {
            $first: '$VAT'
          },
          product: {
            $first: '$product'
          },
          price_without_VAT: {
            $sum: '$withoutVAT',
          },
          products: {
            $first: '$products'
          },
          machine: {
            $first: '$machine'
          },
          product_quantity: {
            $sum: '$products.product_quantity'
          },
          price_with_VAT: {
            $sum: '$price_with_VAT'
          },

        }
      }, {
        $group: {
          _id: '$machine._id',
          totalQuantity: {
            $sum: '$product_quantity'
          },
          totalPriceWithVAT: {
            $sum: '$price_with_VAT'
          },
          totalPriceWithoutVAT: { $sum: '$price_without_VAT' },
          machine: {
            $first: '$machine.machine_name'
          },
          data: {
            $push: {
              product: '$products.product_name',
              //  products: '$products',
              VAT: '$VAT',
              price_with_VAT: '$price_with_VAT',
              price_without_VAT: '$price_without_VAT',
              product_quantity: '$product_quantity'
            }
          }
        },

      },
      {
        $skip: skip
      },
      {
        $limit: resultPerPage
      },
    ])



    let totalPage = Math.ceil(countRecord[0]?.record / resultPerPage)

    return res.json({
      success: true,
      data,
      totalRecord: countRecord[0] ? countRecord[0]?.record : 0,
      currentPage: currentPage,
      totalPage: totalPage ? totalPage : 0
    })

  }
  catch (error) {
    return res.status(202).json({
      success: false,
      message: error.message
    })
  }
}

// CVM-409
exports.inventoryReport = async (req, res, next) => {

  console.log('inventoryReport', req.query);

  try {
    let data
    let filter = {}
    let inventoryFilter = {};
    let dateFilter = {};
    let { machine, product, locations, company, category, canteen, start_date, end_date } = req.query
    const currentPage = Number(req.query.currentPage) || 1
    const resultPerPage = Number(req.query.resultPerPage) || 10
    const pagination = req.query.pagination || "true"
    let totalRevenue = 0
    const skip = resultPerPage * (currentPage - 1);

    if (machine && machine != "all") {
      filter = {
        ...filter,
        "machines.machine_name": machine,
      }
      inventoryFilter = {
        ...inventoryFilter,
        "machine.machine_name": machine,
      }
    }

    if (product && product != "all") {
      filter = {
        ...filter,
        "product_name": product,
      }
      inventoryFilter = {
        ...inventoryFilter,
        "product.product_name": product,
      }
    }
    if (locations && locations != "all") {
      filter = {
        ...filter,
        "machines.machine_location": locations
      }
      inventoryFilter = {
        ...inventoryFilter,
        "machine.machine_location": locations,
      }
    }

    if (canteen && canteen != "all") {
      filter = {
        ...filter,
        "canteens.canteen_name": canteen
      }
      inventoryFilter = {
        ...inventoryFilter,
        "canteens.canteen_name": canteen,
      }
    }

    if (company && company != "all") {
      filter = {
        ...filter,
        "company.user_name": company
      }
      inventoryFilter = {
        ...inventoryFilter,
        "company.user_name": company,
      }
    }

    if (category && category != "all") {
      filter = {
        ...filter,
        "product_category.catagories_name": category
      }
      inventoryFilter = {
        ...inventoryFilter,
        "product_category.catagories_name": category,
      }
    }

    if (start_date && end_date) {
      dateFilter = {
        'last_entry': { $gte: new Date(start_date), $lte: new Date(end_date) }
      };

    }

    /// get product stock 
    data = await productModel.aggregate([{
      $match: {
        product_status: 'Active'
      }
    }, {
      $lookup: {
        from: 'channels',
        localField: '_id',
        foreignField: 'channel_product_id',
        as: 'channel'
      }
    }, {
      $unwind: {
        path: '$channel',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'machines',
        localField: 'channel.machine_id',
        foreignField: '_id',
        as: 'machines'
      }
    }, {
      $unwind: {
        path: '$machines',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'canteens',
        localField: 'channel.canteen_id',
        foreignField: '_id',
        as: 'canteens'
      }
    },
    {
      $unwind: {
        path: '$canteens',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$canteens.canteen_company_ids',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'canteens.canteen_company_ids',
        foreignField: '_id',
        as: 'company'
      }
    },
    {
      $unwind: {
        path: '$company',
        includeArrayIndex: 'string',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$product_catagory_id',
        includeArrayIndex: 'string',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'catagories',
        localField: 'product_catagory_id',
        foreignField: '_id',
        as: 'product_category'
      }
    },
    {
      $unwind: {
        path: '$product_category',
        includeArrayIndex: 'string',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $match: {
        ...filter
      }
    }, {
      $group: {
        _id: '$_id',
        stock: {
          $sum: '$channel.channel_product_quantity'
        },
        product_price: {
          $first: '$product_price'
        },
        product_name: {
          $first: '$product_name'
        },
        product_VAT: {
          $first: '$vat_percentage'
        },
        product_image: {
          $first: '$product_image'
        },
        channel: {
          $addToSet: {
            channel: '$channel.machine_id'
          }
        }
      }
    }, {
      $sort: {
        stock: -1
      }
    }, {
      $project: {
        _id: 1,
        product_name: 1,
        product_price: 1,
        product_VAT: 1,
        stock: 1,
        product_image: '$product_image',
        machines: { $size: '$channel' },
        revenue: { $add: 0 },
        last_entry: { $add: null }
      }
    },
    {
      $skip: skip
    },
    {
      $limit: resultPerPage
    },
    ]);


    /// just to count total document
    let countRecord = await productModel.aggregate([{
      $match: {
        product_status: 'Active'
      }
    }, {
      $lookup: {
        from: 'channels',
        localField: '_id',
        foreignField: 'channel_product_id',
        as: 'channel'
      }
    }, {
      $unwind: {
        path: '$channel',
        preserveNullAndEmptyArrays: true
      }
    },

    {
      $lookup: {
        from: 'machines',
        localField: 'channel.machine_id',
        foreignField: '_id',
        as: 'machines'
      }
    }, {
      $unwind: {
        path: '$machines',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'canteens',
        localField: 'channel.canteen_id',
        foreignField: '_id',
        as: 'canteens'
      }
    },
    {
      $unwind: {
        path: '$canteens',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$canteens.canteen_company_ids',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'canteens.canteen_company_ids',
        foreignField: '_id',
        as: 'company'
      }
    },
    {
      $unwind: {
        path: '$company',
        includeArrayIndex: 'string',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$product_catagory_id',
        includeArrayIndex: 'string',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'catagories',
        localField: 'product_catagory_id',
        foreignField: '_id',
        as: 'product_category'
      }
    },
    {
      $unwind: {
        path: '$product_category',
        includeArrayIndex: 'string',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $match: {
        ...filter
      }
    },
    {
      $group: {
        _id: '$_id',
        stock: {
          $sum: '$channel.channel_product_quantity'
        },
        product_price: {
          $first: '$product_price'
        },
        product_name: {
          $first: '$product_name'
        },
        product_VAT: {
          $first: '$product_VAT'
        },
        product_image: {
          $first: '$product_image'
        },
        channel: {
          $addToSet: {
            channel: '$channel.machine_id'
          }
        }
      }
    }, {
      $sort: {
        stock: -1
      }
    }, {
      $project: {
        _id: 1,
        product_name: 1,
        product_price: 1,
        product_VAT: 1,
        stock: 1,
        product_image: '$product_image',
        machines: { $size: '$channel' },
        revenue: { $add: 0 },
        last_entry: { $add: null }
      }
    },
    {
      $count: "dataCount"
    }]);
    /// count revenue against each product

    for (let i = 0; i < data?.length; i++) {
      const da = await OrderModel.aggregate([
        {
          $match: {
            payment_status: 'SALE'
          }
        },
        {
          $unwind: {
            path: '$products',
            preserveNullAndEmptyArrays: true
          }
        }, {
          $sort: {
            createdAt: -1
          }
        }, {
          $lookup: {
            from: 'machines',
            localField: 'products.machine_id',
            foreignField: '_id',
            as: 'machine'
          }
        }, {
          $unwind: {
            path: '$machine',
            preserveNullAndEmptyArrays: true
          }
        }, {
          $lookup: {
            from: 'products',
            localField: 'products.productId',
            foreignField: '_id',
            as: 'product'
          }
        }, {
          $unwind: {
            path: '$product',
            preserveNullAndEmptyArrays: true
          }
        }, {
          $match: {
            ...inventoryFilter
          }
        },
        {
          $project: {
            products: 1,
            product: 1,
            VAT: '$products.vat_percentage',
            price_with_VAT: {
              $multiply: [
                {
                  $subtract: [{
                    $sum: [
                      {
                        $divide: [
                          {
                            $multiply: [
                              '$products.vat_percentage',
                              '$products.product_price'
                            ]
                          },
                          100
                        ]
                      },
                      '$products.product_price'
                    ]
                  }
                    , '$products.per_product_discount']
                },
                '$products.product_quantity'
              ]
            },
            machine: '$machine',
            last_entry: '$createdAt',
          }
        },
        {
          $match: {
            ...dateFilter
          }
        },
        {
          $group: {
            _id: '$products.productId',
            price_with_VAT: {
              $sum: '$price_with_VAT'
            },
            VAT: {
              $first: '$products.vat_percentage'
            },
            product_name: {
              $first: '$products.product_name'
            },
            product_quantity: {
              $first: '$products.product_quantity'
            },
            last_entry: {
              $first: '$last_entry'
            },
            products: {
              $first: '$products'
            },
            machines: {
              $addToSet: '$machine'
            }
          }
        },
        {
          $match: {
            _id: data[i]._id,
          },
        },


      ])

      if (da.length >= 1) {
        data[i].revenue = da[0]?.price_with_VAT
        data[i].last_entry = da[0]?.last_entry

      }


    }
    let totalPage = Math.ceil(countRecord[0]?.dataCount / resultPerPage)

    // calculate total revenu
    let revenueCount = await OrderModel.aggregate([
      {
        $match: {
          payment_status: 'SALE'
        }
      },
      {
        $unwind: {
          path: '$products',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $sort: {
          createdAt: -1
        }
      }, {
        $lookup: {
          from: 'machines',
          localField: 'products.machine_id',
          foreignField: '_id',
          as: 'machine'
        }
      }, {
        $unwind: {
          path: '$machine',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'canteens',
          localField: 'channel.canteen_id',
          foreignField: '_id',
          as: 'canteens'
        }
      },
      {
        $unwind: {
          path: '$canteens',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$canteens.canteen_company_ids',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'canteens.canteen_company_ids',
          foreignField: '_id',
          as: 'company'
        }
      },
      {
        $unwind: {

          path: '$company',
          includeArrayIndex: 'string',
          preserveNullAndEmptyArrays: true

        }
      },
      {
        $unwind: {
          path: '$product_catagory_id',
          includeArrayIndex: 'string',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'catagories',
          localField: 'product_catagory_id',
          foreignField: '_id',
          as: 'product_category'
        }
      },
      {
        $unwind: {
          path: '$product_category',
          includeArrayIndex: 'string',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'product'
        }
      }, {
        $unwind: {
          path: '$product',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $match: {
          ...inventoryFilter
        }
      },
      {
        $project: {
          products: 1,
          product: 1,
          VAT: '$products.vat_percentage',
          price_with_VAT: {
            $multiply: [
              {
                $subtract: [{
                  $sum: [
                    {
                      $divide: [
                        {
                          $multiply: [
                            '$products.vat_percentage',
                            '$products.product_price'
                          ]
                        },
                        100
                      ]
                    },
                    '$products.product_price'
                  ]
                }
                  , '$products.per_product_discount']
              },
              '$products.product_quantity'
            ]
          },
          machine: '$machine',
          last_entry: '$createdAt'
        }
      },
      {
        $match: {
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$products.productId',
          price_with_VAT: {
            $sum: '$price_with_VAT'
          },
          VAT: {
            $first: '$products.vat_percentage'
          },
          product_name: {
            $first: '$products.product_name'
          },
          product_quantity: {
            $first: '$products.product_quantity'
          },
          last_entry: {
            $first: '$last_entry'
          },
          products: {
            $first: '$products'
          },
          machines: {
            $addToSet: '$machine'
          }
        }
      }]);
    for (let i = 0; i < revenueCount?.length; i++) {
      totalRevenue = totalRevenue + revenueCount[i]?.price_with_VAT

    }

    console.log('inventory data', data);

    //
    return res.json({
      success: true,
      data,
      totalRecord: countRecord[0] ? countRecord[0]?.dataCount : 0,
      currentPage: currentPage,
      totalPage: totalPage ? totalPage : 0,
      totalRevenue
    })

  }
  catch (error) {
    return res.status(202).json({
      success: false,
      message: error.message
    })
  }
}

exports.getMachine = async (req, res, next) => {

  try {
    let machine_location = await machineModel.find().select({ machine_name: 1, machine_location: 1 }).distinct('machine_location');
    let machine_name = await machineModel.find().select({ _id: 0, machine_name: 1 }).distinct('machine_name');
    let product_name = await productModel.find().select({ _id: 0, product_name: 1 }).distinct('product_name');

    return res.json({
      success: true,
      machine_name: machine_name,
      machine_location: machine_location,
      product_name
    });

  }
  catch (error) {
    return res.status(202).json({
      success: false,
      message: error.message
    })
  }
}

exports.topTenEvents = async (req, res, next) => {
  const { month } = req.query;

  const date = new Date(month);
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 2);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  let result;
  if (month) {
    const agg = [
      {
        '$match': {
          'createdAt': {
            '$gte': firstDay,
            '$lte': lastDay
          }
        }
      },
      {
        '$group': {
          '_id': '$event',
          'numMachines': {
            '$count': {}
          }
        }
      }, {
        '$sort': {
          'numMachines': -1
        }
      }, {
        '$limit': 10
      },
      {
        '$project': {
          'description': '$_id',
          'frequency': '$numMachines'
        }
      }
    ];

    result = await events.aggregate(agg).exec();
    result = result.map(r => {
      if (r.description.includes('Machine 201 Event Machine Communication Status:')) {
        return {
          description: r.description.split(',')[0].split(':')[1].trim(),
          frequency: r.frequency
        };
      } else {
        return {
          description: r.description,
          frequency: r.frequency
        };
      }
    });

    const foundEvents = [];
    const foundEventsOnlyDescription = [];
    result.forEach(r => {
      if (!foundEventsOnlyDescription.includes(r.description)) {
        foundEventsOnlyDescription.push(r.description);
        foundEvents.push({
          description: r.description,
          frequency: r.frequency
        });
      }
    });

    result.forEach(r => {
      const event = foundEvents.find(fe => fe.description === r.description);
      if (event) {
        event.frequency += r.frequency;
      }
      // console.log('event', event);
    });

    result = foundEvents;

  } else {
    const response = {
      success: false,
      data: {
        error: 'Filters not given'
      }
    };
    return res.send(response);
  }

  const response = {
    success: true,
    data: result
  };
  return res.send(response);
}

exports.topMachines = async (req, res, next) => {
  const { month } = req.query;

  const date = new Date(month);
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 2);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  let result;
  if (month) {
    const agg = [
      {
        '$lookup': {
          'from': 'canteens',
          'localField': 'canteen_id',
          'foreignField': '_id',
          'as': 'canteens'
        }
      }, {
        '$unwind': {
          'path': '$canteens',
          'includeArrayIndex': 'string',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$match': {
          'createdAt': {
            '$gte': firstDay,
            '$lte': lastDay
          },
          'payment_status': 'SALE'
        }
      }, {
        '$project': {
          'product_name': '$products.product_name',
          'product_quantity': '$products.product_quantity',
          'type': '$payment_method',
          'machine_id': '$products.machine_id',
          'created_at': '$createdAt',
          'payment_status': '$payment_status',
          'total_price': '$total_price'
        }
      }, {
        '$lookup': {
          'from': 'machines',
          'localField': 'machine_id',
          'foreignField': '_id',
          'as': 'machine'
        }
      }, {
        '$unwind': {
          'path': '$machine',
          'includeArrayIndex': 'string',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$project': {
          'machine_id': '$machine_id',
          'machine_name': '$machine.machine_name',
          'total_price': '$total_price',
          'product_quantity': '$product_quantity'
        }
      }, {
        '$group': {
          '_id': '$machine_name',
          'numSales': {
            '$sum': {
              '$sum': '$product_quantity'
            }
          },
          'totalSales': {
            '$sum': '$total_price'
          }
        }
      }, {
        '$sort': {
          'totalSales': -1,
          'numSales': -1
        }
      }, {
        '$project': {
          'machine': '$_id',
          'revenue': '$totalSales',
          'sales': '$numSales'
        }
      }
    ];

    result = await OrderModel.aggregate(agg).exec();
    // console.log(result);
  } else {
    const response = {
      success: false,
      data: {
        error: 'Filters not given'
      }
    };
    return res.send(response);
  }

  result = result.map(r => {
    return {
      machine: r.machine,
      revenue: r.revenue,
      count: r.sales
    };
  });

  const response = {
    success: true,
    data: result
  };
  return res.send(response);
}

// exports.topProducts = async (req, res, next) => {
//   const { month } = req.query;

//   const date = new Date(month);
//   const firstDay = new Date(date.getFullYear(), date.getMonth(), 2);
//   const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
//   let result;
//   if (month) {
//     const agg = [
//       {
//         '$lookup': {
//           'from': 'canteens',
//           'localField': 'canteen_id',
//           'foreignField': '_id',
//           'as': 'canteens'
//         }
//       },
//       {
//         '$unwind': {
//           'path': '$canteens',
//           'includeArrayIndex': 'string',
//           'preserveNullAndEmptyArrays': true
//         }
//       },
//       {
//         '$unwind': {
//           'path': '$products',
//           'includeArrayIndex': 'string',
//           'preserveNullAndEmptyArrays': true
//         }
//       },
//       {
//         '$match': {
//           'createdAt': {
//             '$gte': firstDay,
//             '$lte': lastDay
//           }
//         }
//       },
//       {
//         '$match': {
//           'payment_status': 'SALE'
//         }
//       },
//       {
//         '$project': {
//           'product_id': '$products._id',
//           'product_name': '$products.product_name',
//           'product_price': '$products.product_price',
//           'product_discount':'$products.per_product_discount',
//           'product_quantity': '$products.product_quantity',
//           'type': '$payment_method',
//           'vat': '$products.product_VAT',
//           'machine_id': '$products.machine_id',
//           'created_at': '$createdAt',
//           'payment_status': '$payment_status'
//         }
//       },
//       {
//         '$group': {
//           '_id': { 'product_name': '$product_name' },
//           'numSales': {
//             '$sum': {'$sum': [0, '$product_quantity']}
//           },
//           'totalAmountSales': {
//             '$sum': '$product_price'
//           }
//         }
//       },
//       {
//         '$project': {
//           'product_id': '$_id.product_id',
//           'product_name': '$_id.product_name',
//           'revenue': '$totalAmountSales',
//           'count': '$numSales',

//         }
//       },
//       {
//         '$sort': {
//           'revenue': -1,
//           'count': -1
//         }
//       },
//       {
//         '$limit': 5
//       }
//     ];

//     result = await OrderModel.aggregate(agg).exec();

//     const idsToIgnore = [];
//     const productsToIgnore = result.forEach(r => {
//       if (!idsToIgnore.includes(r.product_id)) {
//         idsToIgnore.push(r.product_id);
//       }
//     });

//     const agg1 = [
//       {
//         '$lookup': {
//           'from': 'canteens',
//           'localField': 'canteen_id',
//           'foreignField': '_id',
//           'as': 'canteens'
//         }
//       },
//       {
//         '$unwind': {
//           'path': '$canteens',
//           'includeArrayIndex': 'string',
//           'preserveNullAndEmptyArrays': true
//         }
//       },
//       {
//         '$unwind': {
//           'path': '$products',
//           'includeArrayIndex': 'string',
//           'preserveNullAndEmptyArrays': true
//         }
//       },
//       {
//         '$match': {
//           'createdAt': {
//             '$gte': firstDay,
//             '$lte': lastDay
//           }
//         }
//       },
//       {
//         '$project': {
//           'product_id': '$products._id',
//           'product_name': '$products.product_name',
//           'total_price': '$total_price',
//           'product_quantity': '$products.product_quantity',
//           'type': '$payment_method',
//           'vat': '$products.product_VAT',
//           'machine_id': '$products.machine_id',
//           'created_at': '$createdAt'
//         }
//       },
//       {
//         '$group': {
//           '_id': { 'product_id': '$product_id', 'product_name': '$product_name' },
//           'numSales': {
//             '$sum': {'$sum': [0, '$product_quantity']}
//           },
//           'totalAmountSales': {
//             '$sum': '$total_price'
//           }
//         }
//       },
//       {
//         '$project': {
//           'product_id': '$_id.product_id',
//           'product_name': '$_id.product_name',
//           'revenue': '$totalAmountSales',
//           'numSales': '$numSales',

//         }
//       },
//       {
//         '$match': {
//           'product_id': {
//             '$nin': idsToIgnore
//           }
//         }
//       },
//       {
//         '$group': {
//           '_id': null,
//           'count': {
//             '$sum': '$numSales'
//           },
//           'revenue': {
//             '$sum': '$revenue'
//           }
//         }
//       }
//     ];


//     //I am removing the product_id from result because result1 coming right after this 
//     //does not have a product_id as it is a combination of all of the other products not in 
//     //the result data structure.
//     result = result.map(r => {
//       return {
//         product_name: r.product_name,
//         revenue: r.revenue,
//         count: r.count
//       };
//     });

//     let result1 = await OrderModel.aggregate(agg1).exec();

//     result1 = result1.map(r1 => {
//       return {
//         product_name: 'Other Products',
//         revenue: r1.revenue,
//         count: r1.count
//       };
//     });
//     result.push(...result1);

//   } else {
//     const response = {
//       success: false,
//       data: {
//         error: 'Filters not given'
//       }
//     };
//     return res.send(response);
//   }

//   const response = {
//     success: true,
//     data: result
//   };
//   return res.send(response);
// }

exports.totalSaleRevenue = async (req, res, next) => {
  const { month } = req.query;

  let result;
  if (month) {
    const date = new Date(month);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 2);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const revenueAgg = [
      {
        '$match': {
          'createdAt': {
            '$gte': firstDay,
            '$lte': lastDay
          },
          'payment_status': 'SALE'
        }
      },
      {
        '$group': {
          '_id': '_id',
          'totalRevenue': {
            '$sum': '$total_price'
          }
        }
      }
    ];

    const resultAggr1 = await OrderModel.aggregate(revenueAgg).exec();
    result = { revenue: resultAggr1[0]?.totalRevenue || 0 };

    const revenueQty = [
      {
        '$match': {
          'createdAt': {
            '$gte': firstDay,
            '$lte': lastDay
          },
          'payment_status': 'SALE'
        }
      }, {
        '$unwind': {
          'path': '$products',
          'includeArrayIndex': 'string',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$group': {
          '_id': '_id',
          'totalQuantity': {
            '$sum': '$products.product_quantity'
          }
        }
      }
    ];

    const resultAggr2 = await OrderModel.aggregate(revenueQty).exec();
    result['sales'] = resultAggr2[0]?.totalQuantity || 0;


  } else {
    const response = {
      success: false,
      data: {
        error: 'Filters not given'
      }
    };
    return res.send(response);
  }

  const response = {
    success: true,
    data: [{ _id: null, ...result }]
  };
  return res.send(response);
}

exports.monthlyMachineReports = async (req, res, next) => {

  try {
    let k = req.query;
    let { date, machine, location, company, payment_method } = req.query;

    const currentPage = Number(req.query.currentPage) || 1
    const resultPerPage = Number(req.query.resultPerPage) || 10
    const pagination = req.query.pagination || "true"

    const skip = resultPerPage * (currentPage - 1);

    let filter = {};

    if (date) {
      var date1 = new Date(date);
    }
    else {
      var date1 = new Date();
    }
    var month = date1.getMonth() + 1;
    var year = date1.getFullYear();

    if (machine && machine != "all") {
      filter = {
        ...filter,
        "machine.machine_name": machine,
      }
    }

    if (location && location != "all") {
      filter = {
        ...filter,
        "machine.machine_location": location,
      }
    }

    let salesAggregate = [
      {
        $match: {
          payment_status: {
            '$in': ['SALE', 'CAPTURE']
          }
        }
      }];

    if (payment_method && payment_method.toLowerCase() != "all") {
      salesAggregate = [...salesAggregate,
      {
        '$match': {
          payment_method: payment_method.toLowerCase(),
        }
      }
      ];
    }

    if (company && company !== 'all') {
      salesAggregate = [...salesAggregate,
      {
        '$lookup': {
          'from': 'canteens',
          'localField': 'canteen_id',
          'foreignField': '_id',
          'as': 'canteen'
        }
      }, {
        '$unwind': {
          'path': '$canteen',
          'includeArrayIndex': 'string',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$match': {
          'canteen.canteen_company_ids': {
            '$in': [
              new mongoose.Types.ObjectId(company)
            ]
          }
        }
      }
      ];
    }

    salesAggregate = [...salesAggregate,
    {
      $unwind: {
        path: '$products',
        preserveNullAndEmptyArrays: true
      }
    }, {
      $lookup: {
        from: 'machines',
        localField: 'products.machine_id',
        foreignField: '_id',
        as: 'machine'
      }
    }, {
      $unwind: {
        path: '$machine',
        preserveNullAndEmptyArrays: true
      }
    }, {
      $addFields: {
        year: {
          $year: '$createdAt'
        },
        month: {
          $month: '$createdAt'
        }
      }
    }, {
      $match: {
        month: month,
        year: year,
        ...filter
      }
    }, {
      $addFields: {
        withoutVAT: {
          $multiply: [
            '$products.product_price',
            '$products.product_quantity'
          ]
        },
        withVAT: {
          $multiply: [{
            $subtract: [{

              $sum: [
                {
                  $divide: [
                    {
                      $multiply: [
                        '$products.vat_percentage',
                        '$products.product_price'
                      ]
                    },
                    100
                  ]
                },
                '$products.product_price'
              ]
            }, '$products.per_product_discount']
          },
            '$products.product_quantity'
          ]
        }
      }
    }, {
      $sort: {
        createdAt: 1
      }
    }, {
      $group: {
        _id: {
          machine_id: '$products.machine_id',
          createdAt: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          }
        },
        machine: {
          $first: '$machine'
        },
        withVAT: {
          $sum: '$withVAT'
        },
        withoutVAT: {
          $sum: '$withoutVAT'
        }
      }
    }, {
      $group: {
        _id: '$_id.machine_id',
        days: {
          $push: {
            date: '$_id.createdAt',
            withVAT: '$withVAT',
            withoutVAT: '$withoutVAT'
          }
        },
        totalwithVAT: {
          $sum: '$withVAT'
        },
        machine: {
          $first: '$machine.machine_name'
        },
        totalwithoutVAT: {
          $sum: '$withoutVAT'
        }
      }
    }, {
      $skip: skip
    }, {
      $limit: resultPerPage
    },
    {
      '$match': {
        '_id': {
          '$ne': null
        }
      }
    },
    {
      $sort: {
        'machine': 1
      }
    }
    ];


    let data = await OrderModel.aggregate(salesAggregate);

    let totalAggregate = [
      {
        $match: {
          payment_status: {
            '$in': ['SALE', 'CAPTURE']
          }
        }
      }];

    if (payment_method && payment_method.toLowerCase() != "all") {
      totalAggregate = [...totalAggregate,
      {
        $match: {
          payment_method: payment_method.toLowerCase(),
        }
      }];
    }


    if (company && company !== 'all') {
      totalAggregate = [...totalAggregate,
      {
        '$lookup': {
          'from': 'canteens',
          'localField': 'canteen_id',
          'foreignField': '_id',
          'as': 'canteen'
        }
      }, {
        '$unwind': {
          'path': '$canteen',
          'includeArrayIndex': 'string',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$match': {
          'canteen.canteen_company_ids': {
            '$in': [
              new mongoose.Types.ObjectId(company)
            ]
          }
        }
      }
      ];
    }


    totalAggregate = [...totalAggregate,
    {
      $unwind: {
        path: '$products',
        preserveNullAndEmptyArrays: true
      }
    }, {
      $lookup: {
        from: 'machines',
        localField: 'products.machine_id',
        foreignField: '_id',
        as: 'machine'
      }
    }, {
      $unwind: {
        path: '$machine',
        preserveNullAndEmptyArrays: true
      }
    }, {
      $addFields: {
        year: {
          $year: '$createdAt'
        },
        month: {
          $month: '$createdAt'
        }
      }
    }, {
      $match: {
        month: month,
        year: year,
        ...filter
      }
    }, {
      $addFields: {
        withoutVAT: {
          $multiply: [
            '$products.product_price',
            '$products.product_quantity'
          ]
        },
        withVAT: {
          $multiply: [
            {
              $sum: [
                {
                  $divide: [
                    {
                      $multiply: [
                        '$products.vat_percentage',
                        '$products.product_price'
                      ]
                    },
                    100
                  ]
                },
                '$products.product_price'
              ]
            },
            '$products.product_quantity'
          ]
        }
      }
    }, {
      $sort: {
        createdAt: 1
      }
    }, {
      $group: {
        _id: {
          machine_id: '$products.machine_id',
          createdAt: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          }
        },
        machine: {
          $first: '$machine'
        },
        withVAT: {
          $sum: '$withVAT'
        },
        withoutVAT: {
          $sum: '$withoutVAT'
        }
      }
    }, {
      $group: {
        _id: '$_id.machine_id',
        days: {
          $push: {
            date: '$_id.createdAt',
            withVAT: '$withVAT',
            withoutVAT: '$withoutVAT'
          }
        },
        totalwithVAT: {
          $sum: '$withVAT'
        },
        machine: {
          $first: '$machine.machine_name'
        },
        totalwithoutVAT: {
          $sum: '$withoutVAT'
        }
      }
    },
    {
      '$match': {
        '_id': {
          '$ne': null
        }
      }
    },
    {
      $count: 'dataCount'
    },
    ];


    let countRecord = await OrderModel.aggregate(totalAggregate);
    let totalPage = Math.ceil(countRecord[0]?.dataCount / resultPerPage)

    return res.json({
      success: true,
      data,
      totalRecord: countRecord[0] ? countRecord[0]?.dataCount : 0,
      currentPage: currentPage,
      totalPage: totalPage ? totalPage : 0,

    })

  }
  catch (error) {
    console.log('error', error);
    return res.status(202).json({
      success: false,
      message: error.message
    })
  }
}

exports.monthlyReports = async (req, res, next) => {

  try {
    let filter = {}

    let allTotalwithVAT = 0
    let allTotalwithoutVAT = 0

    let { date, machine, location, company, payment_method } = req.query;
    payment_method = payment_method.toLowerCase();

    let date1 = new Date();
    if (date) {
      date1 = new Date(date);
    }

    if (machine) {
      filter = {
        ...filter,
        "machine.machine_name": machine,
      };
    }

    if (location) {
      filter = {
        ...filter,
        "machine.machine_location": location,
      };
    }

    let month = date1.getMonth() + 1;
    let year = date1.getFullYear();
    // console.log(month, year)

    let salesAggregate = [
      {
        $match: {
          payment_status: {
            '$in': ['SALE', 'CAPTURE']
          }
        }
      }];

    if (payment_method && payment_method.toLowerCase() != "all") {
      salesAggregate = [...salesAggregate,
      {
        '$match': {
          payment_method: payment_method.toLowerCase(),
        }
      }
      ];
    }

    if (company && company !== 'all') {

      salesAggregate = [...salesAggregate,
      {
        '$lookup': {
          'from': 'canteens',
          'localField': 'canteen_id',
          'foreignField': '_id',
          'as': 'canteen'
        }
      }, {
        '$unwind': {
          'path': '$canteen',
          'includeArrayIndex': 'string',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$match': {
          'canteen.canteen_company_ids': {
            '$in': [
              new ObjectId(company)
            ]
          }
        }
      }
      ];
    }

    salesAggregate = [...salesAggregate,
    {
      $unwind: {
        path: '$products',
        preserveNullAndEmptyArrays: true
      }
    }, {
      $lookup: {
        from: 'machines',
        localField: 'products.machine_id',
        foreignField: '_id',
        as: 'machine'
      }
    }, {
      $unwind: {
        path: '$machine',
        preserveNullAndEmptyArrays: true
      }
    }, {
      $addFields: {
        year: {
          $year: '$createdAt'
        },
        month: {
          $month: '$createdAt'
        }
      }
    }, {
      $match: {
        month: month,
        year: year,
        ...filter
      }
    },
    {
      $addFields: {
        withoutVAT: {
          $multiply: [
            '$products.product_price',
            '$products.product_quantity'
          ]
        },
        withVAT: {
          $multiply: [
            {
              $subtract: [{
                $sum: [
                  {
                    $divide: [
                      {
                        $multiply: [
                          '$products.vat_percentage',
                          '$products.product_price'
                        ]
                      },
                      100
                    ]
                  },
                  '$products.product_price'
                ]
              }, '$products.per_product_discount']
            },
            '$products.product_quantity'

          ]
        }
      }
    }, {
      $group: {
        _id: {
          machine_id: '$products.machine_id',
          createdAt: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          }
        },
        withVAT: {
          $sum: '$withVAT'
        },
        withoutVAT: {
          $sum: '$withoutVAT'
        }
      }
    }, {
      $group: {
        _id: '$_id.createdAt',
        totalwithVAT: {
          $sum: '$withVAT'
        },
        totalwithoutVAT: {
          $sum: '$withoutVAT'
        }
      }
    }, {
      $sort: {
        _id: 1
      }
    }];

    let data = await OrderModel.aggregate(salesAggregate);

    for (let i = 0; i < data?.length; i++) {
      allTotalwithVAT = allTotalwithVAT + data[i].totalwithVAT
      allTotalwithoutVAT = allTotalwithVAT + data[i].totalwithoutVAT

    }

    return res.json({
      success: true,
      data,
      allTotalwithVAT,
      allTotalwithoutVAT,

    })

  }
  catch (error) {
    return res.status(202).json({
      success: false,
      message: error.message
    })
  }
}

// CVM-411
exports.productSales = async (req, res, next) => {
  try {

    let filter = {};
    let { from, machine, location, to } = req.query;

    const currentPage = Number(req.query.currentPage) || 1
    const resultPerPage = Number(req.query.resultPerPage) || 100
    const skip = resultPerPage * (currentPage - 1);


    if (from) {
      var datetimefrom1 = new Date(from);
    }

    if (to) {
      var datetimeto1 = new Date(to);
    }

    // // console.log(datetimefrom1);

    if (datetimefrom1 && datetimeto1) {
      filter = {
        ...filter,
        createdAt: {
          $gte: new Date(datetimefrom1),
          $lt: new Date(datetimeto1)
        }
      }
    }



    if (machine && machine != "all") {
      filter = {
        ...filter,
        "machine.machine_name": machine,
      }
    }

    if (location && location != "all") {
      filter = {
        ...filter,
        "machine.machine_location": location,
      }
    }

    let result = await OrderModel.aggregate([
      {
        $match: {
          payment_status: 'SALE'
        }
      },
      {
        $unwind: {
          path: '$products',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $lookup: {
          from: 'machines',
          localField: 'products.machine_id',
          foreignField: '_id',
          as: 'machine'
        }
      }, {
        $unwind: {
          path: '$machine',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $match: {
          ...filter
        }
      }, {
        $group: {
          _id: {
            machine_id: '$products.machine_id',
            product_id: '$products.productId'
          },
          machine: {
            $first: '$machine.machine_name'
          },
          channels: {
            $push: '$products.channelNumber'
          },
          product: {
            $first: '$products.product_name'
          },
          product_price: {
            $first: '$products.product_price'
          },
          Quantity: {
            $sum: '$products.product_quantity'
          },
          type: {
            $first: '$payment_method'
          },
          product_VAT: {
            $first: '$products.vat_percentage'
          },
          per_product_discount: {
            $first: '$products.per_product_discount'
          }
        }
      }, {
        $project: {
          _id: 0,
          machine: '$machine',
          product: '$product',
          Quantity: '$Quantity',
          channels: 1,
          product_VAT: '$vat_percentage',
          type: '$type',
          WithoutVat: {
            $multiply: [{
              $subtract: [
                '$product_price',
                '$per_product_discount'
              ]
            },
              '$Quantity'
            ]
          },
          withVat: {
            $multiply: [
              {
                $subtract: [{
                  $sum: [
                    {
                      $divide: [
                        {
                          $multiply: [
                            '$product_price',
                            '$product_VAT'
                          ]
                        },
                        100
                      ]
                    },
                    '$product_price'
                  ]
                }, '$per_product_discount'],
              },
              '$Quantity'
            ]
          }
        }
      }, {
        $sort: {
          machine: 1
        }
      }, {
        $skip: skip
      }, {
        $limit: resultPerPage
      }]
    )

    let count = await OrderModel.aggregate([
      {
        $match: {
          payment_status: 'SALE'
        }
      },
      {
        $unwind: {
          path: '$products',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $lookup: {
          from: 'machines',
          localField: 'products.machine_id',
          foreignField: '_id',
          as: 'machine'
        }
      }, {
        $unwind: {
          path: '$machine',
          preserveNullAndEmptyArrays: true
        }
      }, {
        $match: {
          ...filter
        }
      }, {
        $group: {
          _id: {
            machine_id: '$products.machine_id',
            product_id: '$products.productId'
          },
          machine: {
            $first: '$machine.machine_name'
          },
          product: {
            $first: '$products.product_name'
          },
          product_price: {
            $first: '$products.product_price'
          },
          Quantity: {
            $sum: '$products.product_quantity'
          },
          type: {
            $first: '$payment_method'
          },
          product_VAT: {
            $first: '$products.product_VAT'
          }
        }
      }, {
        $project: {
          machine: '$machine',
          product: '$product',
          Quantity: '$Quantity',
          product_VAT: '$product_VAT',
          type: '$type',
          WithoutVat: {
            $multiply: [
              '$product_price',
              '$Quantity'
            ]
          },
          withVat: {
            $multiply: [
              {
                $sum: [
                  {
                    $divide: [
                      {
                        $multiply: [
                          '$product_price',
                          '$product_VAT'
                        ]
                      },
                      100
                    ]
                  },
                  '$product_price'
                ]
              },
              '$Quantity'
            ]
          }
        }
      }, {
        $sort: {
          machine: 1
        }
      }
      , {
        $count: 'totalrecords'
      }
    ]
    )

    let totalPage = Math.ceil(count[0]?.totalrecords / resultPerPage)

    return res.json({
      success: true,
      result,
      currentpage: currentPage || 1,
      totalrecords: count[0] ? count[0].totalrecords : 0,
      totalPage: totalPage || 0
    })
  }
  catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}

exports.salesDashboard = async (req, res, next) => {
  const { month } = req.query;
  if (month) {
    const date = new Date(month);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 2);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const fullMonth = monthNames(firstDay.getMonth());

    const difference = lastDay - firstDay;
    var numberOfDaysInMonth = Math.ceil(difference / (1000 * 3600 * 24)) + 1;
    // console.log(numberOfDaysInMonth);

    const monthDates = [];
    for (let i = 0; i < numberOfDaysInMonth; i++) {
      monthDates.push({
        date: `${fullMonth} ${i + 1}`,
        revenue: 0,
        count: 0,
      });
    }

    const agg = [
      {
        '$group': {
          '_id': '$payment_method'
        }
      }
    ];

    const paymentTypes = await OrderModel.aggregate(agg).exec();
    const monthDatesByTypes = {};
    paymentTypes.forEach(pt => {
      monthDatesByTypes[pt._id] = {
        data: monthDates.map(x => { return { ...x } })
      };
    });

    const agg1 = [
      {
        '$match': {
          'payment_status': 'SALE',
          'order_status': 'delivered'
        }
      }, {
        '$unwind': {
          'path': '$products',
          'includeArrayIndex': 'string',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$group': {
          '_id': '$_id',
          'sum': {
            '$sum': {
              '$sum': [
                0, '$products.product_quantity'
              ]
            }
          }
        }
      }, {
        '$lookup': {
          'from': 'orders',
          'localField': '_id',
          'foreignField': '_id',
          'as': 'result'
        }
      }, {
        '$unwind': {
          'path': '$result',
          'includeArrayIndex': 'string',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$project': {
          'totalQuantity': '$sum',
          'totalSales': '$result.total_price',
          'totalDiscount': '$result.discount',
          'soldAt': '$result.createdAt',
          'payment_type': '$result.payment_method'
        }
      }
    ];
    const payments = await OrderModel.aggregate(agg1).exec();
    // console.log('payments',payments);
    payments.forEach(p => {
      const date = new Date(p.soldAt);
      // console.log(date, date.getDate(), p.payment_type,p);
      // console.log('monthDatesByTypes[p.payment_type]',monthDatesByTypes[p.payment_type]);
      monthDatesByTypes[p.payment_type].data[date.getDate() - 1].revenue += (p.totalSales - p.totalDiscount);
      monthDatesByTypes[p.payment_type].data[date.getDate() - 1].count += p.totalQuantity;

      // console.log('monthDatesByTypes[p.payment_type].data[date.getDate() - 1]',monthDatesByTypes[p.payment_type].data[date.getDate() - 1]);
    });

    console.log('monthDatesByTypes', monthDatesByTypes);
    const response = {
      success: true,
      data: monthDatesByTypes
    };
    return res.send(response);
  } else {
    const response = {
      success: false,
      data: {
        error: 'Filters not given'
      }
    };
    return res.send(response);
  }

}

exports.wastageReport = async (req, res, next) => {
  let data = [];
  // console.log(req.query);
  const { company, canteen, machine, product_category, product, start_date, end_date, resultPerPage, currentPage } = req.query;
  console.log(req.query);

  let wastageData;
  if (company && canteen && machine && product_category && product && start_date && end_date) {

    let aggr = [
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


    if (company && company !== 'all') {
      aggr = [
        ...aggr,
        {
          '$match': {
            'company.user_name': company
          }
        }
      ]
    }

    if (canteen && canteen !== 'all') {
      aggr = [
        ...aggr,
        {
          '$match': {
            'canteen.canteen_name': canteen
          }
        }
      ]
    }

    if (machine && machine !== 'all') {
      aggr = [
        ...aggr,
        {
          '$match': {
            'machine.machine_name': machine
          }
        }
      ]
    }

    if (product_category && product_category !== 'all') {
      aggr = [
        ...aggr,
        {
          '$match': {
            'product_category.catagories_name': product_category
          }
        }
      ]
    }

    if (product && product !== 'all') {
      aggr = [
        ...aggr,
        {
          '$match': {
            'product.product_name': product
          }
        }
      ]
    }

    if (start_date && end_date) {
      aggr = [
        ...aggr,
        {
          '$match': {
            'createdAt': { $gte: new Date(start_date), $lte: new Date(end_date) }
          }
        }
      ]
    }

    wastageData = await wastage.aggregate(aggr).exec();

  } else {
    const response = {
      success: false,
      data: {
        error: 'Filters not given'
      }
    };
    return res.send(response);
  }

  let totalPage = Math.ceil(wastageData.length / Number(resultPerPage))
  const response = {
    success: true,
    data: wastageData,
    totalRecord: wastage.length,
    currentPage: Number(currentPage),
    totalPage: totalPage
  };
  return res.send(response);
};

exports.salesReportv2 = asyncCatchError(async (req, res, next) => {
  let data = [];
  // console.log(req.query);
  const { company, canteen, product, product_category, start_date, end_date, resultPerPage, currentPage, pagination } = req.query;
  let startDate = new Date(start_date);
  startDate = startDate.getFullYear() + "-" + ("0" + (startDate.getMonth() + 1)).slice(-2) + "-" + ("0" + startDate.getDate()).slice(-2);
  let endDate = new Date(end_date);
  endDate = endDate.getFullYear() + "-" + ("0" + (endDate.getMonth() + 1)).slice(-2) + "-" + ("0" + endDate.getDate()).slice(-2);
  const agg = [
    {
      '$match': {
        'payment_status': {
          '$in': [
            'SALE', 'CAPTURE'
          ]
        }
      }
    }, {
      '$lookup': {
        'from': 'canteens',
        'localField': 'canteen_id',
        'foreignField': '_id',
        'as': 'canteen'
      }
    }, {
      '$unwind': {
        'path': '$canteen',
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
      '$addFields': {
        'company_id': '$canteen.canteen_company_ids'
      }
    }, {
      '$lookup': {
        'from': 'users',
        'localField': 'company_id',
        'foreignField': '_id',
        'as': 'company'
      }
    }, {
      '$unwind': {
        'path': '$company',
        'includeArrayIndex': 'string',
        'preserveNullAndEmptyArrays': true
      }
    }, {
      '$unwind': {
        'path': '$products',
        'includeArrayIndex': 'string',
        'preserveNullAndEmptyArrays': true
      }
    }, {
      '$lookup': {
        'from': 'products',
        'localField': 'products.productId',
        'foreignField': '_id',
        'as': 'product'
      }
    }, {
      '$unwind': {
        'path': '$product',
        'includeArrayIndex': 'string',
        'preserveNullAndEmptyArrays': true
      }
    }, {
      '$unwind': {
        'path': '$product.product_catagory_id',
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
      '$project': {
        'company_name': '$company.user_name',
        'product_name': '$products.product_name',
        'product_category_name': '$product_category.catagories_name',
        'canteen_name': '$canteen.canteen_name',
        'order_date': {
          '$dateToString': {
            'format': '%Y-%m-%d',
            'date': '$dispenseStartedOn',
            'timezone': 'Europe/Oslo'
          }
        },
        'price': '$total_price',
        'vat_percentage_product': '$products.vat_percentage',
        'subsidy': '$subsidy_points',
      }
    }, {
      '$match': {
        'order_date': { $gte: startDate, $lte: endDate }
      }
    }, {
      '$group': {
        '_id': {
          'product_name': '$product_name',
          'product_category_name': '$product_category_name',
          'order_date': '$order_date',
          'company_name': '$company_name',
          'canteen_name': '$canteen_name',
          'vat_percentage_product': { $divide: ['$vat_percentage_product', 100] }
        },
        'price': {
          '$sum': '$price'
        },
        'subsidy': {
          '$sum': '$subsidy'
        }
      }
    }, {
      '$sort': {
        '_id.order_date': 1
      }
    }, {
      '$addFields': {
        'total_price': {
          '$add': [
            '$price', '$subsidy'
          ]
        }
      }
    }, {
      '$addFields': {
        'vat_price_nok': {
          '$multiply': [
            '$_id.vat_percentage_product', '$total_price'
          ]
        }
      }
    }

  ];

  if (company && company !== 'all') {
    agg.push({
      '$match': {
        '_id.company_name': company
      }
    })
  }

  if (canteen && canteen !== 'all') {
    agg.push({
      '$match': {
        '_id.canteen_name': canteen
      }
    })
  }

  if (product && product !== 'all') {
    agg.push({
      '$match': {
        '_id.product_name': product
      }
    })
  }

  if (product_category && product_category !== 'all') {
    agg.push({
      '$match': {
        '_id.product_category_name': product_category
      }
    })
  }

  let sales = await OrderModel.aggregate(agg).exec();
  // console.log('sales',sales);
  let totalRecords = sales.length;

  if (pagination && resultPerPage && currentPage) {
    const skip = (Number(resultPerPage) || 10) * ((Number(currentPage) - 1 || 0));
    agg.push(
      {
        '$skip': skip
      });
    agg.push(
      {
        '$limit': Number(resultPerPage) || 10
      });
  }

  sales = await OrderModel.aggregate(agg).exec();


  let totalPage = Math.ceil(totalRecords / Number(resultPerPage))
  const response = {
    success: true,
    data: sales,
    totalRecord: totalRecords,
    currentPage: Number(currentPage),
    totalPage: totalPage
  };
  return res.send(response);

});


