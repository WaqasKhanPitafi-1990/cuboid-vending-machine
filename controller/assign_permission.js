// 

const mongoose = require('mongoose');
// const multer = require('multer')

const ErrorHandler = require('../utils/errorHandling')
const asyncCatchHandler = require('../middleware/catchAsyncError');
const filter = require('../utils/filter')
const roleModel = require('../model/roles')
const pagination = require('../utils/pagination')

exports.assignPermission = asyncCatchHandler(async (req, res, next) => {

    const { role_name, permission_name, role_status } = req.body
    if (!role_name) {
        return next(new ErrorHandler(req.t('role name must be required'), 422))
    }
    const role = await roleModel.findOne({ role_name: role_name })


    if (role) {
        return res.json({ success: false, message: req.t('role name is already registered') })
    }

    const roleAssgin = new roleModel({
        role_name: role_name,
        permission_name: permission_name,
        role_status: role_status
    })

    await roleAssgin.save()
    return res.json({
        success: true,
        message: req.t('Role is created successfully')
    })

})

exports.updateRolePermission = asyncCatchHandler(async (req, res, next) => {
    const { role_id } = req.params
    const { permission_name, role_name, role_status } = req.body


    const roleName = await roleModel.findOne({ role_name: role_name })


    if (roleName && roleName._id != role_id) {
        return res.json({ success: false, message: req.t('role name is already registered') })
    }
    const role = await roleModel.findOne({ _id: mongoose.Types.ObjectId(role_id) })


    if (!role) {
        return res.json({
            success: false,
            message: req.t('role not found')
        })
    }

    if (role) {
        permission_name ? role.permission_name = permission_name : permission_name
        role_name ? role.role_name = role_name : role_name
        role_status ? role.role_status = role_status : role_status

        await role.save()
        return res.json({
            success: true,
            message: req.t('Role is updated successfully')
        })
    }
    return res.json({
        success: false,

    })
})

exports.allRolePermissions = asyncCatchHandler(async (req, res, next) => {

    const { role_id } = req.params
    const role = await roleModel.findOne({ _id: mongoose.Types.ObjectId(role_id) })


    if (!role) {
        return next(new ErrorHandler(req.t('role not found'), 422))
    }

    return res.json({
        success: true,
        data: role
    })

})

exports.deleteRole = asyncCatchHandler(async (req, res, next) => {

    const { role_id } = req.params;

    const deleteData = await roleModel.findOne({ _id: mongoose.Types.ObjectId(role_id), role_status: 'Active' });

    if (!deleteData) {
        return next(new ErrorHandler(req.t('Role not found'), 422))
    }
    deleteData ? deleteData.role_status = 'InActive' : ""
    await deleteData.save()
    res.json({
        success: true,
        message: req.t('Role record is deleted successfully')
    })

})

exports.displayRoles = asyncCatchHandler(async (req, res, next) => {

    let Data = []
    if (req.query.filter) {
        Data = await filter(roleModel.find({ role_name: new RegExp(req.query.filter, 'i') })
            .sort({ createdAt: -1 }), req)

    } else {
        Data = await pagination(roleModel.find({})
            .sort({ createdAt: -1 }), req);
    }

    res.json({
        success: true,
        totalRecord: Data.totalRecord,
        currentPage: Data.currentPage,
        totalPage: Data.totalPage,
        Data: Data.data

    })
})

















