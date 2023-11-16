const mongoose = require('mongoose');
const freeVend = require('../model/freeVend')

const filter = require('../utils/filter')


exports.allFreeVend = async (req, res, next) => {
    try {
        const data = await filter(freeVend.find()
            .populate({ path: 'machine_id', select: { machine_name: 1 } })
            .populate('product_id')
            .populate('channel_id')
            .populate({ path: 'filler_id', select: { user_name: 1 } })
            , req)
        return res.json({
            success: true,
            totalRecord: data.totalRecord,
            currentPage: data.currentPage,
            totalPage: data.totalPage,
            data: data.data
        });
    }
    catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}