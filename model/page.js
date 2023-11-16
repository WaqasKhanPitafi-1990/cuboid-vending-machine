const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title must be required"],
    },

    status: {
      type: String,
      default: "Active",
    },

    description: {
      type: String,
      required: [true, "description  must be required"],
    },
  
  },
  { timestamps: true }
);

module.exports = mongoose.model("page", schema) ;


