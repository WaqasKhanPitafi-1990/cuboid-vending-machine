const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "user",
        required: false
    },
    order: {
        type: mongoose.Types.ObjectId,
        ref: 'order',
        required: [true, 'order must be required']
    },
    reason: {
        type: String,
        required: [true, 'reason must be required']
    },
    amount: {
        type: Number,
        required: [true, 'amount must be reqired']
    },
    paymentType: {
        type: String,
        required: [true, 'paymentType must be required']
    },
    status: {
        type: String,
        required: [true, 'status must be required'],
        enum: ['success', 'failed']
    }
},
{ timestamps: true });

module.exports = mongoose.model('transaction', transactionSchema);

