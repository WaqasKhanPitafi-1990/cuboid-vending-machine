const mongoose = require('mongoose');

const schema = mongoose.Schema(
  {
    
    machine_id: {
      type: mongoose.Types.ObjectId,
      ref:'machine',
      required: [true, 'machine number must be required'],
    },

    product_id:{
        type:mongoose.Types.ObjectId,
        ref:'products'
    },
    filler_id:{
      type:mongoose.Types.ObjectId,
      ref:'user'
    },
    product_price:{
        type:Number,
        default:0
    },
    total_price:{
      type:Number,
      default:0
  },
    product_quantity:{
        type:Number,
        default:0
    },
    channel_id:{
        type:mongoose.Types.ObjectId,
        ref:'channels'
    },
    status:{
        type:String,
        default:'Active'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('freeVend', schema) ;


