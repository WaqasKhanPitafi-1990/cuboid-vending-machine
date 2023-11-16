const mongoose = require('mongoose');

const schema = mongoose.Schema({
  product_name: {
    type: String,
    required: [true, 'Please enter product name'],
  },
  product_price: {
    type: Number,
    required: [true, 'Please enter product price'],
  },

  product_gradient: [{
    type: String,
  }],
  product_description: {
    type: String,
    required: [true, 'Please enter product description'],
  },
  product_image: {
    type: String,
  },
  product_recipes: {
    type: String,
  },
  product_allergies: {
    type: String,
  },
  product_VAT: {
    type: Number,
    required: [true, 'Please enter VAT'],
  },
  product_expiry_date: {
    type: String,

  },
  product_number: {
    type: String
  },
  // quantity: {
  //   type: Number,
  //   default: 0
  // },
  product_catagory_id: [{

    type: mongoose.Types.ObjectId,
    ref: 'catagories',
    required: [true, 'Product catagories must be required']
  }],
  product_status: {
    type: String,
    default: 'Active'
  },
  dispensing_speed: {
    type: Number,
    default: 0
  },
  product_max_limit: {
    type: Number,
    default: 10
  },
  extraction_time: {
    type: Number,
    default: 0
  },

}, { timestamps: true });

module.exports = mongoose.model('products', schema);
