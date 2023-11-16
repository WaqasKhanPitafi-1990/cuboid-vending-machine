const mongoose = require('mongoose');

const schema = mongoose.Schema(
  {
    discount_product_id: {
      type: mongoose.Types.ObjectId,
      ref: "products",
    },

    discount_name: {
      type: String,
      required: [true, "Please enter Promotion name"],
    },
    discount_type: {
      type: String,
      required: [true, "Discount Type must be required"],
    },
    discount_owner: {
      type: String,
      required: [true, "Discount Type must be required"],
    },
    discount_value: {
      type: Number,
      required: [
        true,
        "Please give discount how much discount will you provide, % ",
      ],
    },
    discount_machine_id: {
      type: mongoose.Types.ObjectId,
      ref: "machine",
    },
    discount_canteen_id: {
      type: mongoose.Types.ObjectId,
      ref: "canteen",
    },
    discount_start_date: {
      type: Date,
      required: [true, "Please provide discount starting date"],
    },
   
    discount_end_date: {
      type: Date,
      required: [true, "Please provide discount duration"],
    },
    pirority_level:{
type:Number,
default:0
    },
    discount_parent_id:{
      type:mongoose.Types.ObjectId,
      ref:'user'
    },
    discount_status: {
      type: String,
      default: 'Active'
  },
  
  },
  { timestamps: true }
);

module.exports = mongoose.model('discount', schema);



