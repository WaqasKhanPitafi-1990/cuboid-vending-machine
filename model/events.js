const mongoose = require('mongoose');

const schema = mongoose.Schema(
  {
    canteen_id: {
      type: mongoose.Types.ObjectId,
      ref: 'canteen',
      required: [true, 'Canteen Id must be given'],
    },
    machine_id: {
      type: mongoose.Types.ObjectId,
      ref: 'machine'
    },
    machine_number: {
      type: Number,
      required: [true, 'machine number must be given'],
    },
    status_of_event: {
      type: String,
      required: [true, 'event status  must be given'],
    },
    event:{
        type: String,
        required: [true, 'event  must be given'],
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('event', schema) ;


