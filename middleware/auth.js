const jwt = require("jsonwebtoken");
const asyncCatchHandler = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorHandling");
const userModel = require("../model/userModel");
const roles = require( "../model/roles" );
const mongoose = require("mongoose");
const permissionModel=require('../model/role_permission')

const Auth = (role) =>
  asyncCatchHandler(async (req, res, next) => {
    if (!req.header("Authorization")) {
      return res.json({
        success: false,
        message: "Please pass token in header",
      });
    }

    const token = req.header("Authorization").replace("Bearer ", "");

    const verify = jwt.verify(token, "secret");

    if (!verify) {
      return next(new ErrorHandler("user don't have accesss", 200));
    }

    const id = verify.data;
   let check_permissions=false
    const userData = await userModel
      .findOne({_id:mongoose.Types.ObjectId(id),user_status:'Active'})
      .select({user_password:0});

     
if(!userData){
  new ErrorHandler("User not found", 200)
}

const user_role=userData?userData.user_role:""
      const checkPermissions=userData?await roles.findOne({_id:mongoose.Types.ObjectId(userData.user_role_id),role_status:'Active'}):""

const rolesPermissions=checkPermissions?checkPermissions.permission_name:""
      let checkLength=rolesPermissions?rolesPermissions.length>=1?true:false:false

checkLength ?rolesPermissions.forEach(data=>{

        if(data==role){
       
          check_permissions=true
        }
      }):""

      if(!check_permissions && user_role!='super_admin'){
      return next(
        new ErrorHandler("User don't have access for this module", 200)
      );
    }
    next();
  });

module.exports = Auth;
