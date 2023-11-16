const mongoose = require("mongoose");
const user = require("../model/userModel");
const role = require("../model/roles");
const bcrypt = require("bcryptjs");
const subsidyModel = require('../model/subsidise')
const canteenModel = require('../model/canteen')
var ObjectId = require("mongodb").ObjectID;
const asyncCatchHandler = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorHandling");
const pagination = require('../utils/pagination')
const { logs } = require('../utils/logs')
const {
  userAddMessage,
  userChangePasswordMessage,
  whiteListUserAddMessage,
} = require("../email/emailMessage");
const filter = require('../utils/filter');


exports.addUser = asyncCatchHandler(async (req, res, next) => {
  // return res.status(200).json({ 'message': 'Success' })

  var {
    user_name,
    user_email,
    user_role_id,
    user_password,
    user_role,
    user_phone,
    user_status,
    user_permission,
    white_list_user,
    user_title,
    user_location
  } = req.body;

  const loginUser = req.user
  user_email = user_email.toLowerCase()

  const searchData = await role.findOne({
    _id: mongoose.Types.ObjectId(user_role_id),
    role_status: 'Active'
  });
  if (!searchData) {
    return next(new ErrorHandler(req.t("role not found"), 200));
  }

  if (searchData && searchData.role_name) {
    user_role = searchData.role_name
  }



  const dublicate = await user.find({ user_email: user_email });

  if (dublicate.length > 0) {
    return next(new ErrorHandler(req.t("Email has already registered"), 200));
  } else {
    let gdprToken = await bcrypt.hash(user_password, 10);
    gdprToken = gdprToken.replace(/\//g, '-');
    const hash = await bcrypt.hash(user_password, 10);
    const model = new user({
      user_name,
      user_email,
      user_password: hash,
      user_role_id,
      user_role: user_role ? user_role : "user",
      user_phone,
      user_permission: user_permission,
      user_status: user_status,
      white_list_user: white_list_user,
      user_parent_id: loginUser._id,
      user_title,
      user_location,
      gdpr_accepted: false,
      gdpr_token: gdprToken,
      gdpr_accepted_date: null
    });

    const store = await model.save();
    await logs(null, null, null, null, null, store._id, null, null, null, null, null, null, null, null, "Add user", `${user_name} user, user role ${user_role} has been added from ${req?.user?.user_name}`, req, res, next)
    const link = `${process.env.front_end_URL}/gdpr/${model._id}/${gdprToken}`;
    // Enable for Email Send
    userAddMessage(user_name, user_email, link);
    res.json({
      success: true,
      message: req.t("user has added successfully"),
      user: model,
    });
  }

});

exports.allUser = asyncCatchHandler(async (req, res, next) => {
  console.log('req', req.query);
  const loginUser = req.user;

  console.log('loginUser', loginUser);
  let allUser
  let roleFilter = {}
  if (req.query.user_role && req.query.user_role != 'all') {
    roleFilter = { user_role_id: mongoose.Types.ObjectId(req.query.user_role) }
  }

  if (loginUser && loginUser.user_role == 'super_admin') {
    if (req.query.filter) {
      allUser = await filter(user.find({ $and: [{ ...roleFilter }, { user_role: { $ne: "company_admin" } }], user_status: { $ne: "Deleted" }, white_list_user: false, _id: { $ne: loginUser._id }, $or: [{ user_name: new RegExp(req.query.filter, 'i') }, { user_phone: new RegExp(req.query.filter, 'i') }, { user_email: new RegExp(req.query.filter, 'i') }, { user_status: new RegExp(req.query.filter, 'i') }, { user_role: new RegExp(req.query.filter, 'i') }] }).select({ user_token: 0, user_password: 0, user_permission: 0 }).sort({ createdAt: -1 }), req)
    } else {
      allUser = await pagination(user.find({ $and: [{ ...roleFilter }, { user_role: { $ne: "company_admin" } }], user_status: { $ne: "Deleted" }, white_list_user: false, _id: { $ne: loginUser._id } })
        .select({ user_token: 0, user_password: 0, user_permission: 0 }).sort({ createdAt: -1 }), req);
    }
  } else {
    if (req.query.filter) {
      allUser = await filter(user.find({ $and: [{ ...roleFilter }, { user_role: { $ne: "company_admin" } }], user_status: { $ne: "Deleted" }, white_list_user: false, _id: { $ne: loginUser._id }, user_parent_id: mongoose.Types.ObjectId(loginUser._id), $or: [{ user_name: new RegExp(req.query.filter, 'i') }, { user_phone: new RegExp(req.query.filter, 'i') }, { user_email: new RegExp(req.query.filter, 'i') }, { user_status: new RegExp(req.query.filter, 'i') }, { user_role: new RegExp(req.query.filter, 'i') }] }).select({ user_token: 0, user_password: 0, user_permission: 0 }).sort({ createdAt: -1 }), req)
    } else {
      allUser = await pagination(user
        .find({ $and: [{ ...roleFilter }, { user_role: { $ne: "company_admin" } }], user_status: { $ne: "Deleted" }, white_list_user: false, _id: { $ne: loginUser._id }, user_parent_id: mongoose.Types.ObjectId(loginUser._id) })
        .select({ user_token: 0, user_password: 0, user_permission: 0 }).sort({ createdAt: -1 }), req);
    }
  }



  res.json({
    success: true,
    totalRecord: allUser.totalRecord,
    currentPage: allUser.currentPage,
    totalPage: allUser.totalPage,
    allUser: allUser.data
  });
});

exports.deleteUser = asyncCatchHandler(async (req, res, next) => {
  const id = req.params.id;
  const usersData = await user.findOne({
    _id: mongoose.Types.ObjectId(id)
  });

  if (!usersData) {
    return next(new ErrorHandler(req.t("user not found"), 200));
  }

  usersData ? (usersData.user_status = "Deleted") : usersData.user_status;
  await usersData.save();
  return res.json({
    success: true,
    message: req.t("user has deleted successfully"),
  });
});

exports.updateUser = asyncCatchHandler(async (req, res, next) => {
  const { id } = req.params;

  var {
    user_name,
    user_role_id,
    user_phone,
    user_status,
    user_permission,
    user_title,
    user_location,
    white_list_user
  } = req.body;



  // return res.json({ body: req.body })
  const users = await user.findOne({ _id: mongoose.Types.ObjectId(id) });

  if (!users) {
    return next(new ErrorHandler(req.t("user not found"), 200));
  }

  let user_role = ""

  user_name ? (users.user_name = user_name) : user_name;

  user_phone ? (users.user_phone = user_phone) : user_phone;
  user_role_id ? (users.user_role_id = user_role_id) : user_role_id;
  user_status ? (users.user_status = user_status) : user_status;
  user_title ? (users.user_title = user_title) : user_title;
  user_location ? (users.user_location = user_location) : user_location;


  const searchData = user_role_id ? await role.findOne({
    _id: mongoose.Types.ObjectId(user_role_id),
    role_status: 'Active'
  }) : ""

  if (user_role_id && !searchData) {
    return next(new ErrorHandler(req.t("role not found"), 200));
  }
  if (searchData && searchData.role_name) {
    user_role = searchData.role_name

  }

  user_permission ? (users.user_permission = user_permission) : user_permission;
  user_role && searchData && searchData.role_name ? (users.user_role = user_role) : user_role;


  const userModelData = await users.save();

  ////// Passwor Change Email

  //  userChangePasswordMessage(userModelData.name, userModelData.email)
  /////////////////

  res.json({
    success: true,
    message: req.t("user has updated successfully"),
    data: userModelData,
  });
});


exports.addBulkUser = async (req, res, next) => {
  try {
    const { user_role_id, data } = req.body;
    const roleData = await role.findOne({ _id: mongoose.Types.ObjectId(user_role_id) })
    let checkData = []
    if (!roleData) {
      return res.json({
        success: false,
        message: 'role not found'
      })
    }

    let dataNew = []
    // push all incoming email into dataNew Array
    data.map(data1 => {

      dataNew.push((data1.user_email).toLowerCase())
    })
    //

    let getNew = []

    const getData = await user.find({ user_email: { $in: dataNew } })

    for (let j = 0; j < dataNew.length; j++) {
      for (let i = 0; i < getData.length; i++) {
        if (getData[i].user_email == dataNew[j]) {

          getNew.push(dataNew[j])
        }
      }
    }

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < getNew.length; j++) {

        if (data[i].user_email.toLowerCase() == getNew[j].toLowerCase()) {
          checkData.push(data[i])
          data.splice(i, 1)
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
      let gdprToken = await bcrypt.hash(data.user_password, 10);
      gdprToken = gdprToken.replace(/\//g, '-');
      const hash = await bcrypt.hash(data.user_password, 10);
      const modelData = await new user({
        ...data,
        user_email: data.user_email.toLowerCase(),
        user_role_id,
        user_password: hash,
        user_role: roleData?.role_name,
        user_parent_id: req.user._id,
        gdpr_accepted: false,
        gdpr_token: gdprToken,
        gdpr_accepted_date: null
        // white_list_user:false,
      });

      const store = await modelData.save()
      await logs(null, null, null, null, null, store._id, null, null, null, null, null, null, null, null, "Add user", `${data.user_name} user, user role ${roleData?.role_name} has been added from ${req?.user?.user_name}`, req, res, next)
      const link = `${process.env.front_end_URL}/gdpr/${modelData._id}/${gdprToken}`;
      userAddMessage(data.user_name, data.user_email, link);
    });
   
    if (checkData.length >= 1) {
      return res.json({
        success: true,
        message: 'some of emails records are already registered',
        data: checkData
      })
    }
    return res.json({
      success: true,
      message: 'Users are added successfully',
      data: data,
    });
  }
  catch (err) {
    return res.json({
      success: false,
      message: err.message
    })
  }

}

// Display all company admin
exports.allCompanyAdmin = async (req, res, next) => {
  try {
    let data = []


    if (req?.user?.user_role == 'super_admin') {

      if (req.query.filter) {
        data = await filter(user.find({
          user_role: "company_admin", user_status: { $ne: "Deleted" },
          white_list_user: false, _id: { $ne: req?.user?._id },
          $or: [{ user_name: new RegExp(req.query.filter, 'i') }, { user_email: new RegExp(req.query.filter, 'i') }]
        })
          .select({ user_token: 0, user_password: 0, user_permission: 0 }).sort({ createdAt: -1 }), req)

      }
      else {

        data = await pagination(user.find({
          user_status: { $ne: 'Deleted' }, user_role: 'company_admin',
          _id: { $ne: req?.user?._id }
        }).select({ user_password: 0 }).sort({ createdAt: -1 }), req)

      }
    }
    else {
      if (req.query.filter) {

        data = await filter(user.find({
          $and: [{ user_parent_id: mongoose.Types.ObjectId(req?.user?._id) }, { user_parent_id: { $ne: null } }],
          user_role: "company_admin", user_status: { $ne: "Deleted" }, white_list_user: false, _id: { $ne: req.user?._id },
          $or: [{ user_name: new RegExp(req.query.filter, 'i') }, { user_email: new RegExp(req.query.filter, 'i') }]
        })
          .select({ user_token: 0, user_password: 0, user_permission: 0 }).sort({ createdAt: -1 }), req)

      } else {

        data = await pagination(user.find({
          user_status: { $ne: 'Deleted' },
          $and: [{ user_parent_id: { $ne: null } }, { user_parent_id: mongoose.Types.ObjectId(req?.user?._id) }],
          user_role: 'company_admin', _id: { $ne: req.user?._id }
        })
          .select({ user_password: 0 }).sort({ createdAt: -1 }), req)

      }
    }
    // console.log(data.data)
    var data1 = []

    for (let i = 0; i < data?.data?.length; i++) {
      const canteen = await canteenModel.find({ canteen_status: { $ne: 'Deleted' }, canteen_company_ids: mongoose.Types.ObjectId(data?.data[i]?._doc?._id) }).select({ canteen_company_ids: 0 })
      if (canteen) {

        data1.push({
          ...data.data[i]._doc,
          canteen: canteen

        })
      } else {

        data1.push({
          ...data.data[i]._doc,
          canteen: []
        })
      }
    }

    // for (let i = 0; i < data?.data.length; i++) {
    //   var aa = 0;
    //   if (aa == 0) {
    //     data1.push({
    //       ...data.data[i]._doc,
    //       canteen: []
    //     })
    //     aa++
    //   }
    //   for (let j = 0; j < canteens?.length; j++) {

    //     if (data?.data[i]?._id.toString() == canteens[j]?.company_id.toString()) {
    //       if (aa == 1) {
    //         data1.pop()
    //       }
    //       data1.push({
    //         ...data.data[i]._doc,
    //         canteen: canteens[j]
    //       })
    //       aa++
    //       break;
    //     }
    //     //  else {
    //     //   if (aa == 0) {
    //     //     data1.push({
    //     //       ...data.data[i]._doc,
    //     //       canteen: []
    //     //     })
    //     //     aa++
    //     //   }
    //     // }
    //   }
    // }

    return res.json({
      success: true,
      totalRecord: data.totalRecord,
      currentPage: data.currentPage,
      totalPage: data.totalPage,
      data: data1
    })
  }
  catch (err) {
    return res.json({
      success: false,
      message: err.message
    })
  }

}

exports.userProfile = asyncCatchHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!req.file) {
    return next(
      new ErrorHandler(req.t("Image must be required to update profile"), 422)
    );
  }
  const image = process.env.BASE_URL + "/" + req.file.path;
  const users = await user.findOne({
    _id: mongoose.Types.ObjectId(id),
    user_status: "Active",
  });

  if (!users) {
    return next(new ErrorHandler(req.t("user not found"), 200));
  }

  image ? (users.user_profile = image) : image;

  users.save().then((data) => {
    res.json({
      success: true,
      message: req.t("user profile has updated successfully"),
    });
  });
});

exports.deleteProfile = asyncCatchHandler(async (req, res, next) => {
  const { id } = req.params;

  user.findByIdAndDelete(id).then((user) => {
    if (!user) {
      return next(new ErrorHandler(req.t("user not found"), 200));
    }
    res.json({
      success: true,
      message: req.t("user profile deleted successfully"),
    });
  });
});
exports.showProfile = asyncCatchHandler(async (req, res, next) => {
  const { id } = req.params;
  const userProfile = await user
    .findById({ _id: mongoose.Types.ObjectId(id), user_status: "Active" })
    .select("_id user_name user_profile");

  // console.log(userProfile, "profile")
  if (!userProfile) {
    return next(new ErrorHandler(req.t("user not found"), 200));
  }
  res.json({
    success: true,
    user_profile: userProfile.user_profile,
  });
});

exports.canteenAdminUsers = asyncCatchHandler(async (req, res, next) => {
  const canteenAdminUsers = await user
    .find({ user_role: "canteen_admin", user_status: "Active" })
    .select(
      "user_name user_email user_phone user_role user_profile user_status"
    );

  res.json({
    success: true,
    data: canteenAdminUsers,
  });
});

exports.supplierUser = asyncCatchHandler(async (req, res, next) => {
  const allUser = await user
    .find({ user_role: "food_supplier", user_status: "Active" })
    .select(
      "user_name user_email user_phone user_role user_profile user_status"
    );

  res.json({
    success: true,
    allUser: allUser,
  });
});

exports.whiteListUser = asyncCatchHandler(async (req, res, next) => {
  const allUser = await user
    .find({ user_role: "white_list", user_status: "Active" })
    .select(
      "user_name user_email user_phone user_role user_profile user_status"
    );

  res.json({
    success: true,
    allUser: allUser,
  });
});

// get all active machine filler

exports.displayMachineFiller = async (req, res, next) => {

  const machineFiller = await user.find({ user_role: 'machine_filler', user_status: 'Active' })

  res.json({
    success: true,
    data: machineFiller
  })
}

exports.gdprAcceptance = async(req, res, next) => {
  const {user_id, token, user_password} = req.body;
  if(user_id && token && user_password){
    if(user_password && user_password.length>=6){
      const userObj = await user.findOne({ _id: mongoose.Types.ObjectId(user_id), gdpr_token: token });
      if(userObj){
        let user_password_hashed = await bcrypt.hash(user_password, 10);
        await user.findOneAndUpdate({_id: mongoose.Types.ObjectId(user_id), gdpr_token: token}, {gdpr_accepted: true, user_password: user_password_hashed, gdpr_accepted_date: new Date() });
        return res.json({
          success: true,
          message: 'GDPR accepted and password updated successfully',
        });

      } else {
        return res.json({
          success: false,
          message: 'User not found for the provided details',
        });

      }
    } else {
      return res.json({
          success:false,
          message:'Password must have ateast 6 character'
      });

    }    

  } else {
    return res.json({
      success:false,
      message:'Required fields are missing'
    });
  }
}

exports.getUserDetailsById = async (req, res, next) => {
  try {
    const {user_id, gdprToken} = req.params;

    if(user_id && gdprToken){
      let userObj = await user.findOne({ _id: mongoose.Types.ObjectId(user_id), gdpr_token: gdprToken });
      if (!userObj) {
        return res.json({
          success: false,
          message: 'user not found'
        })
      } else {
        console.log('user',userObj);
        return res.json({
          success: true,
          message: 'User Details',
          data: {
            user_id: userObj._id,
            full_name: userObj.user_name,
            email: userObj.user_email,
            gdpr_accepted: userObj.gdpr_accepted,
            gdpr_accepted_date: userObj.gdpr_accepted_date,
          },
        });
      }

    } else {

    }
  }
  catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}

exports.sendGDPREmail = async (req, res, next) => {
  const {user_id, type} = req.body;
  console.log(req.body);
  if(user_id && type){
    let userObj = await user.findOne({ _id: mongoose.Types.ObjectId(user_id) });
    if(userObj){
      let gdprToken = await bcrypt.hash(userObj.user_email, 10);
      gdprToken = gdprToken.replace(/\//g, '-');
      await user.updateOne({_id: mongoose.Types.ObjectId(user_id)}, {gdpr_token: gdprToken, gdpr_accepted: false, gdpr_accepted_date: null });
      if(type ==='user') {
        const link = `${process.env.front_end_URL}/gdpr/${user_id}/${gdprToken}`;
        userAddMessage(userObj.user_name, userObj.user_email,link);
      } else {
        const link = `${process.env.USER_JOURNEY_FRONTEND_URL}/gdpr/${user_id}/${gdprToken}`;
        whiteListUserAddMessage(userObj.user_name, userObj.user_email,link);
      }
      return res.json({
        success: true,
        message: 'Email has been sent successfully',
      });
    } else {
      return res.json({
        success: false,
        message: 'User not found for the provided details',
      });
    }

  } else {
    return res.json({
      success:false,
      message:'Required fields are missing'
    });
  }
}
