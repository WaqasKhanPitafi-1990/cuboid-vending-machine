const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    machine_id: {
      type: mongoose.Types.ObjectId,
      ref: "machine",
      required: [true, "machine id must be required"],
      
    },
    machine_temperature: {
        type:String,
        required: [true, "temperature must be required"],
        
      },
  
  },
  { timestamps: true }
);

module.exports = mongoose.model("machineTemperatureLogs", schema) ;


