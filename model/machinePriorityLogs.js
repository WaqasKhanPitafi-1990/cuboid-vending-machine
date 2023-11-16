const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title must be given"],
    },

    priority: {
        type: Number,
    },
    status: {
      type: String,
      default: "Active",
    },
  
  },
  { timestamps: true }
);

module.exports = mongoose.model("prioritylogs", schema) ;


