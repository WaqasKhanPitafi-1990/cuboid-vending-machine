const mongoose = require("mongoose");
const validator = require("validator");

const schema = mongoose.Schema(
  {
    role_id: {
      type: mongoose.Types.ObjectId,
      ref:'roles',
      required: [true,"role name must be required"],
    },
    permission_name: {
      type:String,
        required: [true,"permission name must be required"],
      },
      role_permission_status:{
          type:String,
          default:'Active'
      }
    },
  { timestamps: true }
);

module.exports = mongoose.model("role_permission", schema);
