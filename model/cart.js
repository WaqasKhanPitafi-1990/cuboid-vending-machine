const mongoose = require('mongoose');

const schema = mongoose.Schema({

    user_id: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        // require: [true, 'User id must be required']
    },
    cart_status:{
        type:String,
        default:'Active'
    },
    products: [{
        product_id: {
            type: mongoose.Types.ObjectId,
            ref: 'products',

        },
        product_quantity: {
            type: Number,
            default: 1
        },
        // total not need
        total: {
            type: Number,
            default: 1
        },

    }],

}, { timestamps: true });



module.exports = mongoose.model('cart', schema);