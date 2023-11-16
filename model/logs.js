const mongoose = require('mongoose');

const schema = mongoose.Schema(
  {
    canteen_id: {
      type: mongoose.Types.ObjectId,
      ref: 'canteen',
      default:null
    },

    machine_id: {
      type: mongoose.Types.ObjectId,
      ref:'machine',
      default:null
      
    },
    product_id:{
        type:mongoose.Types.ObjectId,
        ref:'products',
        default:null
    },
    banner_id:{
        type:mongoose.Types.ObjectId,
        ref:'banner',
        default:null
    },
    user_id:{
        type:mongoose.Types.ObjectId,
        ref:'user',
        default:null
    },
    wastage_id:{
        type:mongoose.Types.ObjectId,
        ref:'wastage',
        default:null
    },
   
    channel_id:{
        type:mongoose.Types.ObjectId,
        ref:'channels',
        default:null
    },
   
    subsidy_id:{
        type:mongoose.Types.ObjectId,
        ref:'subsidy',
        default:null
    },
    temperature_id:{
        type:mongoose.Types.ObjectId,
        ref:'machineTemperatureLogs',
        default:null
    },
    promotion_id:{
        type:mongoose.Types.ObjectId,
        ref:'promotion',
        default:null
    },
    page_id:{
        type:mongoose.Types.ObjectId,
        ref:'page',
        default:null
    },
    category_id:{
        type:mongoose.Types.ObjectId,
        ref:'catagories',
        default:null
    },
    discount_id:{
        type:mongoose.Types.ObjectId,
        ref:'discount',
        default:null
    },
    event: {
      type: String,
    },

    message:{
        type: String,
      
    },
    filler_id:{
        type:mongoose.Types.ObjectId,
        ref:'user'
       }
  },
   
  { timestamps: true }
);

module.exports = mongoose.model('logs', schema) ;


