const mongoose = require('mongoose');
const userModel = require('./userModel');



const schema = mongoose.Schema({

    banner_title: {
        type: String,
        required: [true, 'Banner must be required']
    },

    banner_description: {
        type: String,
        maxLength: 20
    },
    banner_image: {
        type: String,
        required: [true, 'Banner image must be required']
    },
    banner_status: {
        type: String,
        default: 'Active'
    },
    banner_canteen_ids: [{
        type: mongoose.Types.ObjectId,
        default: null
    }],
    banner_start_date: {
        type: Date,
        required: [true, 'Banner must be required']
    },
    banner_parent_id:{
type:mongoose.Types.ObjectId,
ref:userModel,
    },
    banner_end_date: {
        type: Date,
        required: [true, 'Banner must be required']
    },


},
    { timestamps: true }
);


module.exports = mongoose.model('banner', schema);