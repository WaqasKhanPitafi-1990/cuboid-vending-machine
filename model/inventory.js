const mongoose = require('mongoose');



const schema = mongoose.Schema({

    productId: {
        type: mongoose.Types.ObjectId,
        ref: 'products',
        required: true
    },
    machineId: {
        type: mongoose.Types.ObjectId,
        ref: 'machines',
        required: true
    },

    channel_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    quantity: {
        type: Number,
        required: [true, 'Product quantity must be required'],
        validate(value) {

            if (value < 0) {
                throw new Error('Quantity must be greater than 0')
            }
        },

    }
}, { timestamps: true });

module.exports = mongoose.model('inventory', schema);