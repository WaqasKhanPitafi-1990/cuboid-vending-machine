const mongoose = require('mongoose')
const pagination = require('../utils/pagination')
const canteenModel = require('../model/canteen')
const userModel = require('../model/userModel')

// Display all user record that have company admin role
exports.getAllCompany = async (req, res, next) => {
    try {
        const allCompanyAdmin = await pagination(userModel.find({ user_role: 'company_admin' }), req);

        return res.json({
            success: true,
            totalRecord: allCompanyAdmin.totalRecord,
            currentPage: allCompanyAdmin.currentPage,
            totalPage: allCompanyAdmin.totalPage,
            data: allCompanyAdmin.data
        })
    }
    catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

exports.companyWhiteListUSer = async (req, res, next) => {
    try {
        const { user_parent_id } = req.params

        const companyWhiteListUSer = await pagination(userModel.find({ user_parent_id: mongoose.Types.ObjectId(user_parent_id), white_list_user: true }), req);

        return res.json({
            success: true,
            totalRecord: companyWhiteListUSer.totalRecord,
            currentPage: companyWhiteListUSer.currentPage,
            totalPage: companyWhiteListUSer.totalPage,
            data: companyWhiteListUSer.data
        })
    }
    catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}
// Display all companies that associate with canteen
exports.displayCompanyAssociateWithCanteen = async (req, res, next) => {
    try {
        const { canteen_id } = req.params

        const data = await canteenModel.findOne({ _id: mongoose.Types.ObjectId(canteen_id) }).select({ canteen_company_ids: 1 })
        const companies = await data.canteen_company_ids
        var userData = []

        for (let i = 0; i < companies?.length; i++) {

            const data = await userModel.findOne({ _id: companies[i] })
            userData.push(data)

        }

        return res.json({
            success: true,
            data: userData,
        })
    }
    catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

// Display all company that have created by supera admin and link with canteen
exports.contractCompanyWithCuboid = async (req, res, next) => {
    try {
        const { canteen_id } = req.params

        const data = await canteenModel.findOne({ _id: mongoose.Types.ObjectId(canteen_id) }).select({ canteen_company_ids: 1 })
        const companies = await data.canteen_company_ids
        var userData = []

        for (let i = 0; i < companies?.length; i++) {
            const data = await userModel.findOne({ _id: companies[i] }).populate('user_parent_id')

            if (data.user_parent_id.user_role === 'super_admin') {

                userData.push(data)
            }
        }
        return res.json({
            success: true,
            data: userData,

        })
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

// Display all sub company that assocaite with 1 single company
exports.subCompanies = async (req, res, next) => {
    try {
        const data = await pagination(userModel.find({ user_parent_id: mongoose.Types.ObjectId(req.user._id), user_role: 'company_admin' }).populate('user_parent_id'), req)

        return res.json({

            success: true,
            data,

        })
    }
    catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}