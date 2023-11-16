const mongoose = require('mongoose');
const transactionModel = require('../model/transaction');
const {
    OrderModel
} = require('../model/order');


exports.createTransaction = async (req, res, next) => {
    const { orderId, reason, amount, status } = req.body;
    const loginUser = req.user;

    const order = await OrderModel.findById(orderId);

    if (!order) {
        return res.status(400).json({
            success: false,
            message: 'Order not found',
        })
    }

    try {
        const transaction = await transactionModel.create({
            user: mongoose.Types.ObjectId(loginUser._id), order: orderId, reason, amount, status, paymentType: order.payment_method, status
        })


        res.status(200).json({
            success: true,
            message: 'Transaction created successfully',
            data: transaction
        })
    } catch (error) {
        res.status(200).json({
            success: false,
            message: 'Transaction created failed',
            data: error
        })
    }
}

exports.getAllTransactions = async (req, res, next) => {

    try {
        const allTransactions = await transactionModel.find({});
        res.status(200).json({
            success: true,
            message: 'All transactions found',
            count: allTransactions.length,
            data: allTransactions
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'All transactions not found',
            error: error
        })
    }
}


exports.getTransaction = async (req, res, next) => {

    const { id } = req.params;

    try {
        const transaction = await transactionModel.findById(id);
        res.status(200).json({
            success: true,
            message: 'Transactions found',
            data: transaction
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Transactions not found',
            error: error
        })
    }
}

exports.deleteTransaction = async (req, res, next) => {

    const { id } = req.params;

    try {
        const transaction = await transactionModel.findById(id);
        transaction.remove();
        res.status(200).json({
            success: true,
            message: 'Transactions deleted successfully',
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Transactions deleted failed',
            error: error
        })
    }
}