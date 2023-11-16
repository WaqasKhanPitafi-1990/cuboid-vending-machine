const mongoose = require('mongoose');

const schema = mongoose.Schema({
    wastage_canteen_id: {
        type: mongoose.Types.ObjectId,
        ref:'canteen',
        required: true,
    },
    wastage_machine_id: {
        type: mongoose.Types.ObjectId,
        ref: 'machine',
        required: true,
    },
    wastage_product_id: {
        type: mongoose.Types.ObjectId,
        ref: 'products',
        required: true,
    },
    wastage_product_quantity: {
        type: Number,
        required: [true,'Product quantity must be required'],
    },
    wastage_status:{
        type:String,
        default:'Active'
    },
    wastage_channel_id:{
        type: mongoose.Types.ObjectId,
        ref:'channels',
        // default:null
    },
    filler:{
        type:mongoose.Types.ObjectId,
        ref:'user'
    }
  
   
}, { timestamps: true });

module.exports = mongoose.model('wastage', schema);
