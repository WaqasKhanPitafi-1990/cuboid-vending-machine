const mongoose = require('mongoose');

const schema = mongoose.Schema(
  {
    canteen_name: {
      type: String,
      required: true,
    },
    canteen_location: {
      type: String,
      required: true,
    },
    canteen_status: {
      type: String,
      default: 'Active'
    },
    product_vend_limit: {
      type: Number,
      default: 5
    },
    canteen_company_ids: [{
      type: mongoose.Types.ObjectId,
      ref: 'user',
  
    }],
    machine_filler_id: {
      type: mongoose.Types.ObjectId,
      ref: 'user',
      default: null
    },
    canteen_admin_id: {
      type: mongoose.Types.ObjectId,
      ref: 'user',
      default: null
    },
    canteen_parent_id: {
      type: mongoose.Types.ObjectId,
      ref: 'user',
      default: null
    },
    end_point: {
      type: String
    },
    payment_method: {
      type: String,
      default:null
    },
    guest_use: {
      type: String,
      default: 'Yes'
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model('canteen', schema);