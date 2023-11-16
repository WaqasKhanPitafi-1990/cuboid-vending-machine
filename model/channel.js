const mongoose = require('mongoose');

const schema = mongoose.Schema(
  {

    machine_id: {
      type: mongoose.Types.ObjectId,
      ref: 'machine',
      required: [true, 'Machine Id must be required'],
    },
    canteen_id: {
      type: mongoose.Types.ObjectId,
      ref: 'canteen',
    },
    row_number: {
      type: Number,
      required: [true, 'row number must be required']
    },
    channel_width: {
      type: Number,

      default: 1
    },
    merge_channel: [{
      type: mongoose.Types.ObjectId,
      default: null

    }],  
    channel_name: {
      type: Number,
      required:true
    },

    channel_product_id: {
      type: mongoose.Types.ObjectId,
      ref:'products',
      default: null
    },
    channel_product_quantity: {
      type: Number,
      default: 0
    },
    channel_product_threshold: {
      type: Number,
      default:0
    },
    channel_extraction_time: {
      type: Number,
      default: 0
    },
    
    channel_order: {
      type: Number,
      required:[true,'Channel Order must be required',422]
    },
    channel_status: {
      type: String,
      default: 'Active'
    },
    channel_product_limit: {
      type: Number,
      default: 1
    },
    channel_machine_status: {
      type: String,
      default: 'Not Connected'//Not Connected, In service with product, In service but sold out, Channel Faulty
    },
    mapped_tray_number: {
      type: Number,
      default: 11
    },
    mapped_channel_number: {
      type: Number,
      default: 1
    },
    dispensing_speed: {
      type:Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('channels', schema);
