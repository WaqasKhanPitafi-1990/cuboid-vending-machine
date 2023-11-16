const { type } = require("express/lib/response");
const mongoose = require("mongoose");
const schema = mongoose.Schema(
  {
    permissions:[
      {
        name:{
          type:String
        },
        permission:{
          type:Array
        }
      }
    ]

    // permission_name: {
    //   type: String,
    //   required: [true, "Permissions Name must be required"],
     
    // },
    // permission_status: {
    //   type: String,
    // },
  },
  { timestamps: true }
);
module.exports = mongoose.model("permissions", schema);
