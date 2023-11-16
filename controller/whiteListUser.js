// addWhiteList, displayWhiteList,deleteWhiteList, updateWhiteList
const mongoose = require('mongoose');
const user = require('../model/userModel')
const bcrypt = require('bcryptjs')
const pagination = require('../utils/pagination')
const filter = require('../utils/filter')
const { logs } = require('../utils/logs')
const {
  whiteListUserAddMessage,
} = require("../email/emailMessage");
exports.addWhiteList = async (req, res, next) => {
  try {
    var {
      user_name,
      user_email,
      user_password,
      user_canteen_id,
      user_phone,
      user_status,
      company_id
    } = req.body;

    const loginUser = req.user
    user_email = user_email.toLowerCase()
    const dublicate = await user.find({ user_email: user_email });

    if (dublicate.length > 0) {
      return res.json({
        success: false,
        message: req.t('Email has already registered')
      })

    } else {
      let gdprToken = await bcrypt.hash(user_password, 10);
      gdprToken = gdprToken.replace(/\//g, '-');
      const hash = await bcrypt.hash(user_password, 10);
      const model = new user({
        user_name,
        user_email,
        user_password: hash,
        user_role_id: null,
        user_role: null,
        user_canteen_id,
        user_phone,
        user_status: user_status,
        white_list_user: true,
        user_parent_id: company_id,
        subsidy_points: req?.user?.subsidy_points,
        gdpr_accepted: false,
        gdpr_token: gdprToken,
        gdpr_accepted_date: null
      });
      const store = await model.save();
      await logs(null, null, null, null, null, store._id, null, null, null, null, null, null, null, null, "Add white list user", `${user_name} white list user has been added from ${req?.user?.user_name}`, req, res, next)
      const link = `${process.env.USER_JOURNEY_FRONTEND_URL}/gdpr/${model._id}/${gdprToken}`;
      // Enable for Email Send
      whiteListUserAddMessage(user_name, user_email, link);
      return res.json({
        success: true,
        message: req.t("user is added successfully"),
        user: model,
      });
    }
  }
  catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}

exports.displayWhiteList = async (req, res, next) => {
  try {
    let displayUser
    let f = {}
    if (req.query.company_id) {

      f = { ...f, user_parent_id: mongoose.Types.ObjectId(req.query.company_id) }
    }
    if (req.query.canteen_id) {

      f = { ...f, user_canteen_id: mongoose.Types.ObjectId(req.query.canteen_id) }
    }
    if (req.user.user_role == "super_admin") {

      if (req.query.filter) {

        displayUser = await filter(user.find({ ...f, user_status: { $ne: "Deleted" }, white_list_user: 'true', $or: [{ user_name: new RegExp(req.query.filter, 'i') }, { user_phone: { $regex: req.query.filter, $options: 'i' } }, { user_email: new RegExp(req.query.filter, 'i') }, { user_status: new RegExp(req.query.filter, 'i') }] })
          .select({ user_name: 1, user_email: 1, white_list_user: 1, user_phone: 1, user_status: 1, user_canteen_id: 1, subsidy_points:1, gdpr_accepted:1, gdpr_accepted_date:1 })
          .populate({ path: 'user_canteen_id', select: { canteen_name: 1, _id: 1 } })
          .populate({ path: 'user_parent_id', select: { user_name: 1 } })
          .populate({ path: 'user_canteen_id', select: { canteen_name: 1, _id: 1 } }).sort({ createdAt: -1 }), req)
      } else {
        displayUser = await pagination(user.find({ ...f, user_status: { $ne: "Deleted" }, white_list_user: 'true' })
          .select({ user_name: 1, user_email: 1, white_list_user: 1, user_phone: 1, user_status: 1, user_canteen_id: 1, subsidy_points:1, gdpr_accepted:1, gdpr_accepted_date:1 })
          .populate({ path: 'user_canteen_id', select: { canteen_name: 1, _id: 1 } })
          .populate({ path: 'user_parent_id', select: { user_name: 1 } })
          .sort({ createdAt: -1 }), req);
      }
    } else {
      if (req.query.filter) {
        displayUser = await filter(user.find({ ...f, user_status: { $ne: "Deleted" }, user_parent_id: mongoose.Types.ObjectId(req.user?._id), white_list_user: 'true', $or: [{ user_name: new RegExp(req.query.filter, 'i') }, { user_phone: new RegExp(req.query.filter, 'i') }, { user_email: new RegExp(req.query.filter, 'i') }, { user_status: new RegExp(req.query.filter, 'i') }] })
          .select({ user_password: 0 }).populate({ path: 'user_canteen_id', select: { canteen_name: 1, _id: 1 } })
          .populate({ path: 'user_canteen_id', select: { canteen_name: 1, _id: 1 } })
          .populate({ path: 'user_parent_id', select: { user_name: 1 } })
          .sort({ createdAt: -1 }), req)
      } else {
        displayUser = await pagination(user.find({ ...f, user_status: { $ne: "Deleted" }, user_parent_id: mongoose.Types.ObjectId(req.user?._id), white_list_user: 'true' })
          .select({ user_password: 0 }).populate({ path: 'user_canteen_id', select: { canteen_name: 1, _id: 1 } })
          .populate({ path: 'user_parent_id', select: { user_name: 1 } })
          .sort({ createdAt: -1 }), req);
      }
    }

    return res.json({
      success: true,
      totalRecord: displayUser.totalRecord,
      currentPage: displayUser.currentPage,
      totalPage: displayUser.totalPage,
      data: displayUser.data
    })
  }
  catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}
exports.deleteWhiteList = async (req, res, next) => {
  try {
    const { user_id } = req.params
    let deleteUser = await user.findOne({ _id: mongoose.Types.ObjectId(user_id) })
    if (!deleteUser) {
      return res.json({
        success: false,
        message: req.t('User not found')
      })
    }
    deleteUser ? deleteUser.user_status = 'Deleted' : ""
    await deleteUser.save()
    return res.json({
      success: true,
      message: req.t('white list user is deleted successfully')
    })
  }
  catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}
exports.updateWhiteList = async (req, res, next) => {
  try {
    const { user_id } = req.params
    let { user_name, subsidy_points, user_phone, user_password, user_canteen_id, user_status, company_id } = req.body

    if (user_password) {
      const hash = await bcrypt.hash(user_password, 10);
      user_password = hash
    }
    let updateUser = await user.findOne({ _id: mongoose.Types.ObjectId(user_id) })
    if (!updateUser) {
      return res.json({
        success: false,
        message: req.t('user not found')
      })
    }
    user_name ? updateUser.user_name = user_name : user_name
    user_phone ? updateUser.user_phone = user_phone : user_phone
    user_password ? updateUser.user_password = user_password : user_password
    user_canteen_id ? updateUser.user_canteen_id = user_canteen_id : user_canteen_id
    user_status ? updateUser.user_status = user_status : updateUser.user_status
    subsidy_points ? updateUser.subsidy_points = subsidy_points : updateUser.subsidy_points
    company_id ? updateUser.user_parent_id = company_id : updateUser.user_parent_id;

    updateUser && updateUser.save()

    return res.json({
      success: true,
      message: req.t('User is updated successfully'),

    })
  }
  catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}



exports.addBulkWhiteListUser = async (req, res, next) => {
  try {
    const { data } = req.body;
    
    console.log('data',data);
    let checkData = []
    let dataNew = []
    // push all incoming email into dataNew Array
    data.map(data1 => {

      dataNew.push(data1.user_email.toLowerCase())
    });
   let getNew = [];
   const getData = await user.find({ user_email: { $in: dataNew } });

    for (let j = 0; j < dataNew.length; j++) {
      for (let i = 0; i < getData.length; i++) {
        if (getData[i].user_email.toLowerCase() == dataNew[j].toLowerCase()) {
          getNew.push(dataNew[j].toLowerCase());
        }
      }
    }
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < getNew.length; j++) {
        if (data[i].user_email.toLowerCase() == getNew[j].toLowerCase()) {
          checkData.push(data[i]);
          data.splice(i, 1);

        }
      }
    }
    // return res.json(data)

    if (data?.length < 1) {
      return res.json({
        success: true,
        message: 'All emails are already exist',
        data: checkData
      })
    }

    data.map(async data => {
      const subsidyPoints = !isNaN(parseInt(data.subsidy_points)) ? parseInt(data.subsidy_points) : 0 ;
      let canteenIds = data.user_canteen_id.split(';').map((item) => mongoose.Types.ObjectId(item.trim()));
      let gdprToken = await bcrypt.hash(data.user_password, 10);
      gdprToken = gdprToken.replace(/\//g, '-');
      const hash = await bcrypt.hash(data.user_password, 10);
      const modelData = await new user({
        ...data,
        user_canteen_id: canteenIds,
        user_email: data.user_email.toLowerCase(),
        user_password: hash,
        white_list_user: true,
        subsidy_points: subsidyPoints,
        user_parent_id: new mongoose.Types.ObjectId(data.user_parent_id),
        gdpr_accepted: false,
        gdpr_token: gdprToken,
        gdpr_accepted_date: null
      });
      const store = await modelData.save()
      await logs(null, null, null, null, null, store._id, null, null, null, null, null, null, null, null, "Add white list user", `${data?.user_name}  white list user has been added from ${req?.user?.user_name}`, req, res, next);
      const link = `${process.env.USER_JOURNEY_FRONTEND_URL}/gdpr/${modelData._id}/${gdprToken}`;
      whiteListUserAddMessage(data.user_name, data.user_email, link);

    });

    if (checkData.length >= 1) {
      return res.json({
        success: true,
        message: 'some of emails records are already registered',
        data: checkData
      });
    }
    res.json({
      success: true,
      message: 'White list users are added successfully',
      data: data,
    });
  }
  catch (error) {
    console.log('error bulk white user', error);
    return res.json({
      success: false,
      message: error.message
    });
  }
}
