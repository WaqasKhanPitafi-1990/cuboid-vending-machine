const mongoose = require("mongoose");

const canteenModel = require("../model/canteen");
const machineModel = require("../model/verdering");
const channelModel = require("../model/channel");
const ErrorHandler = require("../utils/errorHandling");
const asyncCatchHandler = require("../middleware/catchAsyncError");
const channel = require("../model/channel");
const pagination = require('../utils/pagination')
const userModel = require("../model/userModel");
const filter = require('../utils/filter')
const { logs } = require('../utils/logs')
const subsidyModel = require('../model/subsidise')



exports.addCanteen = asyncCatchHandler(async (req, res, next) => {

  let { payment_method, canteen_company_ids, canteen_name, canteen_location, canteen_status, canteen_admin_id, machine_filler_id, guest_use } = req.body;
  let rows = 5
  let column = 7
  const loginUser = req.user
  const canteenAdminVerify = await userModel.findOne({ _id: mongoose.Types.ObjectId(canteen_admin_id), user_role: 'canteen_admin', user_status: 'Active' })
  if (!canteenAdminVerify) {
    return next(new ErrorHandler(req.t("Canteen admin not found"), 200));
  }
  // const foodSupplier=await userModel.findOne({_id:mongoose.Types.ObjectId(food_supplier_id),user_role:'food_supplier',user_status:'Active'})
  // if (!foodSupplier) {
  //   return next(new ErrorHandler(req.t("Food Supplier not found"), 200));
  // }
  const machineFiller = await userModel.findOne({ _id: mongoose.Types.ObjectId(machine_filler_id), user_role: 'machine_filler', user_status: 'Active' })
  if (!machineFiller) {
    return next(new ErrorHandler(req.t("Machine filler not found"), 200));
  }
  const model = await new canteenModel({
    canteen_name,
    canteen_location,
    canteen_status,
    // food_supplier_id,
    canteen_admin_id,
    canteen_parent_id: loginUser._id,
    machine_filler_id,
    canteen_company_ids,
    payment_method,
    guest_use
  });
  const store = await model.save();
  await logs(store._id, null, null, null, null, null, null, null, null, null, null, null, null, null, "Add canteen", `${canteen_name} canteen has been added from ${req?.user?.user_name}`, req, res, next)

  // const pk = model._id;

  // var machine_id = "";
  // for (let i = 0; i <= 1; i++) {

  //   const model1 = await new machineModel({
  //     machine_name: canteen_name + ' machine' + i,
  //     canteen_id: pk,
  //     machine_code: i,
  //     machine_location: canteen_location,
  //     machine_channel_rows: rows,
  //     machine_channel_column: column,
  //     machine_status: canteen_status,
  //     machine_temperature: null,
  //     machine_parent_id: req.user ? req.user._id : "",
  //     payment_method
  //   });
  //   await model1.save();
  //   machine_id = model1._id;

  //   var modeClame = [];
  //   let name = 0
  //   for (let i = 1; i <= rows; i++) {
  //     name = name + 10

  //     for (let j = 1; j <= column; j++) {

  //       const channelModel11 = await new channelModel({
  //         machine_id: model1._id,
  //         row_number: i,
  //         channel_name: name + j,
  //         channel_order: j,
  //         canteen_id: pk
  //       })
  //       await channelModel11.save();
  //     }
  //   }
  // }
  // console.log(modeClame)

  res.status(200).json({
    success: true,
    message: req.t("Canteen is created successfully"),
    canteen: model,
  });
});

exports.allCanteen = asyncCatchHandler(async (req, res, next) => {
  const loginUser = req.user


  let allCanteen
  if (loginUser.user_role == "super_admin") {
    if (req.query.filter) {
      allCanteen = await filter(canteenModel.find({
        canteen_status: { $ne: "Deleted" },
        $or: [{ canteen_name: new RegExp(req.query.filter, 'i') }, { canteen_location: new RegExp(req.query.filter, 'i') }, { canteen_status: new RegExp(req.query.filter, 'i') }]
      })
        .populate({ path: 'canteen_company_ids', select: { user_token: 0, user_password: 0, user_permission: 0 } })
        .populate({ path: 'machine_filler_id', select: { user_token: 0, user_password: 0, user_permission: 0 } })
        .populate({ path: 'canteen_admin_id', select: { user_token: 0, user_password: 0, user_permission: 0 } })
        .sort({ createdAt: -1 }), req)
    } else {
      allCanteen = await pagination(canteenModel.find({ canteen_status: { $ne: "Deleted" } })
        .populate({ path: 'canteen_company_ids', select: { user_token: 0, user_password: 0, user_permission: 0 } })
        .populate({ path: 'machine_filler_id', select: { user_token: 0, user_password: 0, user_permission: 0 } })
        .populate({ path: 'canteen_admin_id', select: { user_token: 0, user_password: 0, user_permission: 0 } })
        .sort({ createdAt: -1 }), req);
    }
  }
  else if (loginUser.user_role == "canteen_admin") {
    if (req.query.filter) {
      allCanteen = await filter(canteenModel.find({
        canteen_status: { $ne: "Deleted" },
        $or: [{ canteen_name: new RegExp(req.query.filter, 'i') }, { canteen_location: new RegExp(req.query.filter, 'i') }, { canteen_status: new RegExp(req.query.filter, 'i') }]
      })
        .populate({ path: 'canteen_company_ids', select: { user_token: 0, user_password: 0, user_permission: 0 } })
        .populate({ path: 'machine_filler_id', select: { user_token: 0, user_password: 0, user_permission: 0 } })
        .populate({ path: 'canteen_admin_id', select: { user_token: 0, user_password: 0, user_permission: 0 } })
        .sort({ createdAt: -1 }), req)
    } else {
      allCanteen = await pagination(canteenModel.find({
        canteen_status: { $ne: "Deleted" },
        $or: [{ canteen_admin_id: mongoose.Types.ObjectId(loginUser._id) }, { canteen_parent_id: mongoose.Types.ObjectId(loginUser._id) }]
      })
        .populate({ path: 'canteen_company_ids', select: { user_token: 0, user_password: 0, user_permission: 0 } })
        .populate({ path: 'machine_filler_id', select: { user_token: 0, user_password: 0, user_permission: 0 } })
        .populate({ path: 'canteen_admin_id', select: { user_token: 0, user_password: 0, user_permission: 0 } })
        .sort({ createdAt: -1 }), req);
    }
  }
  else if (loginUser.user_role == "company_admin") {

    allCanteen = await filter(canteenModel.find({
      canteen_status: { $ne: "Deleted" },
      canteen_company_ids: mongoose.Types.ObjectId(req.user._id),
      $or: [{ canteen_name: new RegExp(req.query.filter, 'i') }, { canteen_location: new RegExp(req.query.filter, 'i') }, { canteen_status: new RegExp(req.query.filter, 'i') }]
    })
    .populate({ path: 'canteen_company_ids', select: { user_token: 0, user_password: 0, user_permission: 0 } })
    .populate({ path: 'machine_filler_id', select: { user_token: 0, user_password: 0, user_permission: 0 } })
    .populate({ path: 'canteen_admin_id', select: { user_token: 0, user_password: 0, user_permission: 0 } })
      .sort({ createdAt: -1 }), req);

    return res.json({
      success: true,
      totalRecord: allCanteen?.totalRecord,
      currentPage: allCanteen?.currentPage,
      totalPage: allCanteen?.totalPage,
      allCanteen: allCanteen?.data
    })

  }
  else {
    if (req.query.filter) {
      allCanteen = await filter(canteenModel.find({
        canteen_status: { $ne: "Deleted" },
        $or: [{ canteen_name: new RegExp(req.query.filter, 'i') }, { canteen_location: new RegExp(req.query.filter, 'i') }, { canteen_status: new RegExp(req.query.filter, 'i') }]
      })
      .populate({ path: 'canteen_company_ids', select: { user_token: 0, user_password: 0, user_permission: 0 } })
        .populate({ path: 'machine_filler_id', select: { user_token: 0, user_password: 0, user_permission: 0 } })
        .populate({ path: 'canteen_admin_id', select: { user_token: 0, user_password: 0, user_permission: 0 } })
        .sort({ createdAt: -1 }), req)
    } else {
      allCanteen = await pagination(canteenModel.find({
        canteen_status: { $ne: "Deleted" },
        canteen_parent_id: mongoose.Types.ObjectId(loginUser._id)
      })
      .populate({ path: 'canteen_company_ids', select: { user_token: 0, user_password: 0, user_permission: 0 } })
        .populate({ path: 'machine_filler_id', select: { user_token: 0, user_password: 0, user_permission: 0 } })
        .populate({ path: 'canteen_admin_id', select: { user_token: 0, user_password: 0, user_permission: 0 } })
        .sort({ createdAt: -1 }), req);
    }
  }
  //  await console.log(allCanteen)
  res.json({
    success: true,
    totalRecord: allCanteen.totalRecord,
    currentPage: allCanteen.currentPage,
    totalPage: allCanteen.totalPage,
    allCanteen: allCanteen.data,
  });
});

exports.deleteCanteen = asyncCatchHandler(async (req, res, next) => {
  const id = req.params.id;

  const checkCanteen = await canteenModel.findOne({ _id: mongoose.Types.ObjectId(id) })

  if (!checkCanteen) {
    return next(new ErrorHandler(req.t("Canteen not found"), 200));
  }
  checkCanteen ? checkCanteen.canteen_status = 'Deleted' : checkCanteen.canteen_status
  await checkCanteen.save()
  await machineModel.updateMany({ canteen_id: mongoose.Types.ObjectId(id) }, { machine_status: 'Deleted' })
  return res.json({
    success: true,
    message: req.t("Canteen is deleted successfully"),

  });

})
exports.searchCanteen = asyncCatchHandler(async (req, res, next) => {
  const { id } = req.params;
  const searchData = await canteenModel.findOne({ _id: mongoose.Types.ObjectId(id) });
  if (!searchData) {
    return next(new ErrorHandler(req.t("Canteen not found"), 200));
  }
  res.json({
    success: true,
    searchData,
  });
});
exports.updateCanteen = asyncCatchHandler(async (req, res, next) => {
  const { id } = req.params;
  let { payment_method, canteen_company_ids, canteen_name, canteen_location, canteen_status, canteen_admin_id, machine_filler_id, guest_use } = req.body;

  let canteen = await canteenModel.findOne({ _id: mongoose.Types.ObjectId(id) })
  if (!canteen) {
    return next(new ErrorHandler(req.t("Canteen not found"), 200));
  }

  const canteenAdminVerify = canteen_admin_id ? await userModel.findOne({ _id: mongoose.Types.ObjectId(canteen_admin_id), user_role: 'canteen_admin', user_status: 'Active' }) : ""
  if (canteen_admin_id && !canteenAdminVerify) {
    return next(new ErrorHandler(req.t("Canteen admin not found"), 200));
  }
  // const foodSupplier=food_supplier_id? await userModel.findOne({_id:mongoose.Types.ObjectId(food_supplier_id),user_role:'food_supplier',user_status:'Active'}) :""
  // if (food_supplier_id&&!foodSupplier) {
  //   return next(new ErrorHandler(req.t("Food Supplier not found"), 200));
  // }
  const machineFiller = machine_filler_id ? await userModel.findOne({ _id: mongoose.Types.ObjectId(machine_filler_id), user_role: 'machine_filler', user_status: 'Active' }) : ""
  if (machine_filler_id && !machineFiller) {
    return next(new ErrorHandler(req.t("machine filler not found"), 200));
  }
  canteen_name ? (canteen.canteen_name = canteen_name) : canteen_name;
  canteen_location ? (canteen.canteen_location = canteen_location) : canteen_location;
  canteen_status ? (canteen.canteen_status = canteen_status) : canteen_status;
  canteen_admin_id ? (canteen.canteen_admin_id = canteen_admin_id) : canteen_admin_id;
  canteen_company_ids ? (canteen.canteen_company_ids = canteen_company_ids) : canteen_company_ids;
  machine_filler_id ? canteen.machine_filler_id = machine_filler_id : machine_filler_id
  payment_method ? canteen.payment_method = payment_method : payment_method,
  guest_use ? canteen.guest_use = guest_use : guest_use 
  canteen.save();
  if (canteen_status) {
    await machineModel.updateMany({ canteen_id: mongoose.Types.ObjectId(id) }, { machine_status: canteen_status })
  }
  res.json({
    success: true,
    message: req.t("Canteen is updated successfully"),
    canteen: canteen,
  });
});

// Assign Canteen tu canteen_admin
exports.canteenAdmin = asyncCatchHandler(async (req, res, next) => {

  const { canteen_id, canteen_admin_id } = req.params;

  const user = await userModel.findOne({ _id: mongoose.Types.ObjectId(canteen_admin_id), user_role: 'canteen_admin', user_status: 'Active' })

  if (!user) {
    return next(new ErrorHandler(req.t("Canteen admin not found"), 200));
  }

  const assignCanteen = await canteenModel.findOne({ _id: mongoose.Types.ObjectId(canteen_id), canteen_status: 'Active' })

  if (!assignCanteen) {
    return next(new ErrorHandler(req.t("Canteen not found"), 200));
  }

  user ? assignCanteen.canteen_admin_id = canteen_admin_id : assignCanteen.canteen_admin_id

  await assignCanteen.save()

  res.json({
    success: true,
    message: req.t('canteen is assigned successfully')
  })
})

/// Update Canteen Admins

exports.updatecanteenAdmin = asyncCatchHandler(async (req, res, next) => {

  const { canteen_id, canteen_admin_id } = req.params;

  const canteen_admin = await userModel.findOne({ _id: mongoose.Types.ObjectId(canteen_admin_id), user_role: 'canteen_admin', user_status: 'Active' })

  if (!canteen_admin) {
    return next(new ErrorHandler(req.t("Canteen admin not found"), 200));
  }

  const assignCanteen = await canteenModel.findOne({ _id: mongoose.Types.ObjectId(canteen_id), canteen_status: 'Active' })

  if (!assignCanteen) {
    return next(new ErrorHandler(req.t("Canteen not found"), 200));
  }

  assignCanteen ? assignCanteen.canteen_admin_id = canteen_admin_id : assignCanteen.canteen_admin_id

  await assignCanteen.save()

  res.json({
    success: true,
    message: req.t('canteen admin is updated successfully')
  })
})

/// Display canteen admin all canteens

exports.displayAdminCanteens = asyncCatchHandler(async (req, res, next) => {

  const { canteen_admin_id } = req.params;

  const canteen_admin = await userModel.findOne({ _id: mongoose.Types.ObjectId(canteen_admin_id), user_role: 'canteen_admin', user_status: 'Active' })

  if (!canteen_admin) {
    return next(new ErrorHandler(req.t("Canteen admin not found"), 200));
  }

  const canteenAdmin = await canteenModel.find({ canteen_admin_id: mongoose.Types.ObjectId(canteen_admin_id), canteen_status: 'Active' })




  res.json({
    success: true,
    data: canteenAdmin
  })
})

///// Display All Machine under 1 canteen

exports.machineCanteen = asyncCatchHandler(async (req, res, next) => {
  const { canteen_id } = req.params;

  const canteen_Link_Machine = await machineModel.find({
    canteen_id: mongoose.Types.ObjectId(canteen_id),
    machine_status: 'Active'
  });



  res.json({
    success: true,
    All_Machines: canteen_Link_Machine,
  });
});

//// Assign or update Canteen to supplier

exports.assignCanteen = asyncCatchHandler(async (req, res, next) => {
  const { canteen_id, supplier_id } = req.params;

  const user = await userModel.findById({
    _id: mongoose.Types.ObjectId(supplier_id), user_status: 'Active'
  });
  if (!user) {
    return next(new ErrorHandler(req.t("User not found"), 200));
  }
  const assignCanteen = await canteenModel.findOne({
    _id: mongoose.Types.ObjectId(canteen_id),
    canteen_status: 'Active'
  });

  if (!assignCanteen) {
    return next(new ErrorHandler(req.t("Canteen not found"), 200));
  }

  user ? (assignCanteen.supplier_id = supplier_id) : assignCanteen.supplier_id;

  await assignCanteen.save();

  res.json({
    success: true,
    message: req.t("canteen is assigned successfully"),
  });
});

///// Display All Canteen under 1 Supplier
exports.supplierCanteen = asyncCatchHandler(async (req, res, next) => {
  const { supplier_id } = req.params;

  const user = await userModel.findById({
    _id: mongoose.Types.ObjectId(supplier_id),
    user_status: 'Active'
  });

  if (!user) {
    return next(new ErrorHandler(req.t("User not found"), 422));
  }
  const assignCanteen = await canteenModel
    .find({ supplier_id: mongoose.Types.ObjectId(supplier_id), canteen_status: 'Active' })
    .populate({
      path: "supplier_id",
      select: { user_password: 0, user_permission: 0 },
    });


  res.json({
    success: true,
    assignCanteen,
  });
});

// Canteen endPoint update
exports.endPointCanteen = async (req, res, next) => {

  try {
    const { canteen_id, end_point } = req.body;

    let canteenData = await canteenModel.findOne({ _id: mongoose.Types.ObjectId(canteen_id) })

    if (!canteenData) {
      return res.status(200).json({
        success: false,
        message: req.t('canteen not found')
      })
    }

    canteenData ? canteenData.end_point = end_point : ""
    canteenData.lastHeartBeat = new Date();
    await canteenData.save();

    return res.status(200).json({
      success: true,
      message: req.t("canteen endpoint has  updated")
    })
  }
  catch (error) {
    return res.status(202).json({
      success: false,
      message: error.message
    })
  }
}