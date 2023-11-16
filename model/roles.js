const { type } = require("express/lib/response");
const mongoose = require("mongoose");
const schema = mongoose.Schema(
  {
    role_name: {
      type: String,
      required: [true, "role_name must be required"],
   
    },
   permission_name:{
     type:Array
   },
    
    role_status: {
      type: String,
      default:'Active'
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("roles", schema);
