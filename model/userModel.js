const mongoose = require("mongoose");
const validator = require("validator");
const { check, res } = require("express-validator");
const schema = mongoose.Schema(
  {
    user_name: {
      type: String,
      required: true,
    },
    user_email: {
      type: String,
      required: true,
      unique: [true, "Email is already register"],
      validate(value) {
     
        if (!validator.isEmail(value)) {
          throw new Error("Email must be in email format");
        }
      },
    },
    user_phone: {
      type: String,
      required: true,
    },
    white_list_user: {
      type: Boolean,
        default:false
    
    },
    user_canteen_id:[{
      type:mongoose.Types.ObjectId,
      ref:'canteen',
      default:null
    }],
    user_password: {
      type: String,
      required: true,
    },
    user_role_id: {
      type: mongoose.Types.ObjectId,
      ref: "roles",
    },

    user_role: {
      type: String,
    },
    user_permission: [
      {
        type: String,
      },
    ],

    user_profile: {
      type: String,
      default: null,
    },
    user_status: {
      type: String,
      default: "Active",
    },
    user_token: {
      type: String,
      default: null,
    },
    food_supplier_id: { /// assign to machine filler
      type: mongoose.Types.ObjectId,
      ref: 'user',
      default: null
    },
    user_parent_id:{
      type:mongoose.Types.ObjectId,
      ref:'user',
      default:null
    },
    subsidy_points:{
      type:Number,
      default:0
    },
    subsidy_points_renew:{ // in days
      type:Number,
      default:1
    },
    user_title:{ 
      type:String,
      default:null
    },
    user_location:{
      type:String,
      default:null
    },
    gdpr_accepted:{
      type:Boolean,
      default: false
    },
    gdpr_accepted_date:{
      type:Date,
      default: null
    },
    gdpr_token: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", schema);
