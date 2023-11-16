const mongoose = require('mongoose');

const schema = mongoose.Schema({


    catagories_name: {
        type: String,
        required: true
    },
    catagories_status: {
        type: String,
        default: 'Active'
    },
    catagories_image:{
        type:String,
        
    }
}, { timestamps: true });


module.exports = mongoose.model('catagories', schema);