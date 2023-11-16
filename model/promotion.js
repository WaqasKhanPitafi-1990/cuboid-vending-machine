const mongoose = require("mongoose");

const schema = mongoose.Schema({
  promo_name: {
    type: String,
    required: [true, "Please enter Promotion name"],
  },
  promo_code: {
    type: String,
   
    required: [true, "Please enter Promotion code "],
  },
  promo_description: {
    type: String,
    required: [true, "Please enter Promotion description"],
  },
  promo_start_date: {
    type: Date,
    required: [true, "Please provide promotion starting date"],
  },

  promo_end_date: {
    type: Date,
    required: [true, "Please provide promotion expire Date"],
  },
  promo_type: {
    type: String,
    required: [true, "Please provide promotion type"],
  },
  promo_value: {
    type: Number,
  },
  promo_productid: {
    type: mongoose.Types.ObjectId,
    ref: "products",
  },
  promo_status: {
    type: String,
    required: [true, "Please provide promotion Status"],
  },
  promo_parent_id:{
    type:mongoose.Types.ObjectId,
    ref:'user'
  },
},{timestamps:true});

module.exports = mongoose.model("promotion", schema);
