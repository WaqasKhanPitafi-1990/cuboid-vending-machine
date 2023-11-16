const mongoose = require('mongoose');
const model = require('../model/subsidise')
const userModel = require('../model/userModel')
const pagination = require('../utils/pagination')
const filter = require('../utils/filter')
const { logs } = require('../utils/logs')
var cron = require('node-cron');
const axios = require('axios')
exports.createSubsidy = async (req, res, next) => {
    try {
        let { canteen_id, renew_period, subsidy_type, subsidy, status, start_date, end_date, company_id } = req.body;
        renew_period = Number(renew_period) || 1
        start_date = new Date(start_date).toISOString()
        end_date = new Date(end_date).toISOString()
        const checkSubsidy = await model.findOne({ company_id: mongoose.Types.ObjectId(company_id), status: 'Active' })

        if (checkSubsidy) {
            return res.status(200).json({
                success: false,
                message: "subsidy for this company is already created, you can update it",
            })
        }
        
        if (subsidy_type == "credit_base" && new Date(start_date) <= new Date()) {
            const data = await userModel.updateMany({ $or: [{ _id: mongoose.Types.ObjectId(company_id) }, { user_parent_id: mongoose.Types.ObjectId(company_id) }] }, { subsidy_points: Number(subsidy) })
            const r1 = new Date(start_date) || new Date()
            start_date = r1.setDate(r1.getDate() + renew_period);
        }
        const subsidyModel = new model({
            canteen_id,
            subsidy_type,
            subsidy,
            status,
            start_date,
            end_date,
            company_id,
            renew_period,
            subsidy_parent_id: req.user._id
        })


        const store = await subsidyModel.save()
        await logs(null, null, null, null, null, null, null, null, null, null, null, null, null, store._id, "Add subsidy", `${subsidy} subsidy has been added from ${req?.user?.user_name}`, req, res, next)


        res.status(200).json({
            success: true,
            message: 'Subsidy is created successfully',
        })
    } catch (error) {
        return res.status(202).json({
            success: false,
            error,
            message: error.message
        })
    }
}

exports.getAllSubsidy = async (req, res, next) => {

    try {
        var subsidise
        if (req.user.user_role == 'super_admin') {
            if (req.query.filter) {
                subsidise = await filter(model.find({
                    status: { $ne: "Deleted" },
                    $or: [{ end_date: new RegExp(req.query.filter, 'i') },
                    { subsidy_type: new RegExp(req.query.filter, 'i') }, { start_date: new RegExp(req.query.filter, 'i') },
                    { subsidy: new RegExp(req.query.filter, 'i') }, { status: new RegExp(req.query.filter, 'i') }]
                })
                    .populate({ path: 'company_id', select: { user_name: 1 } }).populate({ path: 'canteen_id', select: { canteen_name: 1 } })
                    .sort({ createdAt: -1 }), req)
            } else {
                subsidise = await pagination(model.find({ status: { $ne: "Deleted" }, user_status: { $ne: "Deleted" } }).populate({ path: 'company_id', select: { user_name: 1 } })
                    .populate({ path: 'canteen_id', select: { canteen_name: 1 } })
                    .sort({ createdAt: -1 }), req)
            }
        }
        else {
            if (req.query.filter) {
                subsidise = await filter(model.find({ status: { $ne: "Deleted" }, $or: [{ company_id: mongoose.Types.ObjectId(req.user._id) }, { subsidy_parent_id: mongoose.Types.ObjectId(req.user._id) }], $or: [{ end_date: new RegExp(req.query.filter, 'i') }, { subsidy_type: new RegExp(req.query.filter, 'i') }, { start_date: new RegExp(req.query.filter, 'i') }, { subsidy: new RegExp(req.query.filter, 'i') }, { status: new RegExp(req.query.filter, 'i') }] }).populate({ path: 'company_id', select: { user_name: 1 } }).populate({ path: 'canteen_id', select: { canteen_name: 1 } })
                    .sort({ createdAt: -1 }), req)
            } else {

                subsidise = await pagination(model.find({ status: { $ne: "Deleted" }, $or: [{ company_id: mongoose.Types.ObjectId(req.user._id) }, { subsidy_parent_id: mongoose.Types.ObjectId(req.user._id) }] }).populate({ path: 'company_id', select: { user_name: 1 } }).populate({ path: 'company_id', select: { user_name: 1 } })
                    .populate({ path: 'canteen_id', select: { canteen_name: 1 } })
                    .sort({ createdAt: -1 }), req)
                ////check  
            }
        }
        res.status(200).json({
            success: true,
            totalRecord: subsidise.totalRecord,
            currentPage: subsidise.currentPage,
            totalPage: subsidise.totalPage,
            data: subsidise.data,
        })
    } catch (error) {
        return res.status(202).json({
            success: false,
            error,
            message: error.message
        })
    }
}

exports.getSubsidy = async (req, res, next) => {

    try {
        const { id } = req.params;
        const data = await model.findOne({ _id: mongoose.Types.ObjectId(id) }).populate({ path: 'canteen_id', select: { canteen_name: 1 } })
        if (!data) {
            return res.status(200).json({
                success: false,
                message: 'Subsidy not found',
            })
        }
        res.status(200).json({
            success: true,
            data
        })
    } catch (error) {
        return res.status(202).json({
            success: false,
            error,
            message: error.message
        })
    }
}


exports.deleteSubsidy = async (req, res, next) => {

    try {

        const { id } = req.params;

        const data = await model.findOne({ _id: mongoose.Types.ObjectId(id) })
        if (!data) {
            return res.status(200).json({
                success: false,
                message: 'Subsidy not found',
            })
        }

        data ? data.status = 'Deleted' : ''
        await data.save()


        res.status(200).json({
            success: true,
            message: 'Subsidy is deleted successfully'
        })
    } catch (error) {
        return res.status(202).json({
            success: false,
            error,
            message: error.message
        })
    }
}

exports.updateSubsidy = async (req, res, next) => {
    try {
        let { id } = req.params;
        let { renew_period, company_id, subsidy, status, canteen_id, subsidy_type, start_date, end_date } = req.body;
        const data = await model.findOne({ _id: mongoose.Types.ObjectId(id) })
        if (!data) {
            return res.status(200).json({
                success: false,
                message: 'Subsidy not found',
            })
        }
        const checkSubsidy = await model.findOne({ company_id: mongoose.Types.ObjectId(data.company_id), status: 'Active' })
        if (checkSubsidy && (checkSubsidy._id).toString() != mongoose.Types.ObjectId(id)) {
            return res.status(200).json({
                success: false,
                message: "subsidy for this canteen is already created, you can't update it",
            })
        }
        if (subsidy_type == 'credit_base') {
            if (!subsidy) {
                return res.json({
                    success: false,
                    message: "subsidy point must be reuired for change credit_base"
                })
            }

            if (!renew_period) {
                return res.json({
                    success: false,
                    message: "credit point renew time must be required for credit base"
                })
            }
            // const data2 = await userModel.updateMany({ $or: [{ _id: mongoose.Types.ObjectId(company_id) }, { user_parent_id: mongoose.Types.ObjectId(company_id) }] }, { subsidy_points: Number(subsidy) })
            // const data1 = await userModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(company_id) }, { subsidy_points_renew: renew_period })
        }
        canteen_id ? data.canteen_id = canteen_id : "",
            subsidy_type ? data.subsidy_type = subsidy_type : "",
            subsidy ? data.subsidy = subsidy : "",
            status ? data.status = status : "",
            start_date ? data.start_date = new Date(start_date).toISOString() : "",
            end_date ? data.end_date = new Date(end_date).toISOString() : "",
            renew_period ? data.renew_period = renew_period : ""
        // company_id ? data.company_id = company_id : ""
        await data.save()


        res.status(200).json({
            success: true,
            message: 'subsidy is updated successfully'
        })

    } catch (error) {
        return res.status(202).json({
            success: false,
            error,
            message: error.message
        })
    }
}



exports.job = async (req, res, next) => {
    try {
        const date = new Date()
        const data = await model.find({ subsidy_type: 'credit_base', status: 'Active', start_date: { $lte: new Date(date) } })

        for (let i = 0; i < data?.length; i++) {

            const period = Number(data[i].renew_period) || 1
            let result = new Date(data[i].start_date) || new Date()

            await userModel.updateMany({ white_list_user: true, user_parent_id: mongoose.Types.ObjectId(data[i].company_id) }, { $set: { subsidy_points: data[i].subsidy } })
            data[i].start_date = result.setDate(date.getDate() + period);
            await data[i].save()
        }

        res.status(200).json({
            success: true,
            data
        })

    } catch (error) {
        return res.status(202).json({
            success: false,
            error,
            message: error.message
        })
    }
}
// console.log("process.env.BASE_URL",process.env.BASE_URL)
cron.schedule('0 0 0 * * *', async () => {

    axios.put(`${process.env.BASE_URL}/api/v1/subsidy/job`)
});

