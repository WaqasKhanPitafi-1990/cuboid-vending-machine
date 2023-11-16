

const mongoose = require("mongoose");

const model = require("../model/machinePriorityLogs");
const ErrorHandler = require("../utils/errorHandling");
const asyncCatchHandler = require("../middleware/catchAsyncError");
const pagination = require('../utils/pagination')
const filter = require('../utils/filter')
const { logs } = require('../utils/logs')

exports.addPriority = async (req, res, next) => {

    try {
        const { title, status, priority } = req.body

        const da = await model.findOne({ title: title, $or: [{ status: 'Active' }, { status: 'InActive' }] })
        if (da) {
            return res.json({
                success: false,
                message: 'this log title already has been created',
                data: da
            })
        }
        const data = await new model({
            title,
            status,
            priority
        })
        await data.save()
        return res.status(200).json({
            success: true,
            message: req.t("priority log added successfully"),
            data,
        });
    }
    catch (err) {
        return res.json({
            success: false,
            message: err.message
        })
    }
}
exports.allPriority = async (req, res, next) => {
    try {
        let filter = {}
        if (req.query.title) {
            filter = {
                ...filter,
                $or: [{ title: new RegExp(req.query.title, 'i') }, { status: new RegExp(req.query.title, 'i') }]
            }
        }
        if (req.query.priority) {
            filter = {
                ...filter,
                priority: req.query.priority
            }
        }
        const data = await pagination(model.find({ ...filter, status: { $ne: 'Deleted' } }).sort({ createdAt: -1 }), req)
        return res.status(200).json({
            success: true,
            totalRecord: data.totalRecord,
            currentPage: data.currentPage,
            totalPage: data.totalPage,
            allPages: data.data,
        });
    }
    catch (err) {
        return res.json({
            success: false,
            message: err.message
        })
    }
}
exports.deletePriority = async (req, res, next) => {
    try {
        const { id } = req.params
        const data = await model.findOne({ _id: mongoose.Types.ObjectId(id), status: { $ne: 'Deleted' } })
        if (!data) {
            return res.status(200).json({
                success: false,
                message: 'priority log not found',
                model,
            });
        }
        data ? data.status = "Deleted" : ""
        await data.save()
        res.status(200).json({
            success: true,
            message: req.t("priority log has been deleted successfully")
        });
    }
    catch (err) {
        return res.json({
            success: false,
            message: err.message
        })
    }
}
exports.updatePriority = async (req, res, next) => {
    try {
        const { id } = req.params
        const { title, status, priority } = req.body

        const data = await model.findOne({ _id: mongoose.Types.ObjectId(id), status: { $ne: 'Deleted' } })
        if (!data) {
            return res.status(200).json({
                success: false,
                message: 'priority log not found',
                model,
            });
        }


        const da = await model.findOne({ _id: { $ne: mongoose.Types.ObjectId(data._id) }, title: title, $or: [{ status: 'Active' }, { status: 'InActive' }] })
        if (da) {
            return res.json({
                success: false,
                message: 'this log title already has been created',
                data: da
            })
        }
        title ? data.title = title : ""
        status ? data.status = status : ""
        priority ? data.priority = priority : ""

        await data.save()
        res.status(200).json({
            success: true,
            message: req.t("priority log has been updated successfully"),

        });
    }
    catch (err) {
        return res.json({
            success: false,
            message: err.message
        })
    }
}
exports.searchPriority = async (req, res, next) => {
    try {
        const { id } = req.params;

        const data = await model.findOne({ _id: mongoose.Types.ObjectId(id), status: { $ne: 'Deleted' } })


        return res.status(200).json({
            success: true,
            data
        });
    }
    catch (err) {
        return res.json({
            success: false,
            message: err.message
        })
    }
}