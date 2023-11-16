const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')

const user = require('../model/userModel')
const mongoose = require('mongoose');
const roleModel = require('../model/roles')
// const { emailRegistration } = require('../email/account')
const jwt = require('jsonwebtoken')
const { forgotPassword } = require('../email/account')
const ErrorHandler = require('../utils/errorHandling')
const asyncCatchHandler = require('../middleware/catchAsyncError');

exports.signupController = asyncCatchHandler(async (req, res, next) => {

    let { user_name, user_email, user_phone, user_role_id, user_role, user_password } = req.body;
    user_email = user_email.toLowerCase()
    const errors = validationResult(req);

    if (errors.errors.length > 0) {

        if (errors.errors.length > 1) {
            errors.errors.map(msg => {
                res.json({ err: msg.msg })
            })
            res.json({ error: errors.errors })
        } else {
            errors.errors.map(data => {

                return res.json({
                    error_aya: data.msg

                })


            })
        }
    } else {

        const dublicate = await user.find({ user_email: user_email })

        if (dublicate.length > 0) {
            return res.json({
                success: false,
                message: "Email is already register"
            })
        } else {
            const hash = await bcrypt.hash(user_password, 10);

            const model = new user({
                user_name,
                user_email,
                user_phone,
                user_password: hash,
                user_role_id,
                user_role
            })


            await model.save()
            return res.json({
                success: true,
                message: 'User is registered successfully'
            })

            // //// Email Registration


            //  emailRegistration(data.name, data.email)


        }
    }

})


exports.loginController = async (req, res) => {
    try {
        let { user_email, user_password } = req.body;

        user_email = user_email.toLowerCase();

        const data = await user.find({ white_list_user: false, user_email: user_email, user_status: "Active" })

        if (data.length < 1) {
            return res.json({
                success: false,
                message: req.t('user name or password is wrong')
            })
        }

        if(data[0].gdpr_accepted_date === null && !data[0].gdpr_accepted){
            return res.json({
                success: false,
                message: 'You have not accepted the GDPR Acceptance Form. Please check your email and follow the instructions given in it in order to continue.'
            })
        }


        const result = await bcrypt.compare(user_password, data[0].user_password)

        if (result) {
            // 7 day expiration time
            const token = jwt.sign({
                data: data[0]._id,
            }, 'secret', { expiresIn: '7d' });

            // const exampleFilter = ({ keepMe, keepMeToo }) => ({ keepMe, keepMeToo })


            const userData = await user
                .findOne({ _id: mongoose.Types.ObjectId(data[0]._id) })
                .select({ user_password: 0 });


            const permissions = userData && userData.user_role_id ? await roleModel.findOne({ _id: mongoose.Types.ObjectId(userData.user_role_id) }) : []



            return res.json({
                success: true,
                message: req.t('user is signin successfully'),
                token: token,
                user: userData,
                permissions: permissions

            })
        } else {
            return res.json({
                success: false,
                message: req.t('user name or password is wrong')
            })
        }


        // next()
    }
    catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

exports.resetController = async (req, res) => {
    try {

        const token = req.body.token

        const user_password = req.body.user_password;
        if (!token) {
            return res.json({
                success: false,
                message: req.t('token must be required')
            })
        }
        if (!user_password) {
            return res.json({ success: false, message: req.t('password must be required') })
        }
        const verify = await jwt.verify(token, 'secret')


        if (!verify) {
            return res.json({
                success: 'false',
                message: req.t("Token is not valid")
            })
        }

        const userObj = await user.findOne({ _id: mongoose.Types.ObjectId(verify?.id), user_status: 'Active' })
        if (!userObj) return res.json({ success: false, message: req.t("User not found!") })
        if (userObj && userObj.user_token != token) {
            return res.json({ success: false, message: req.t("Unauthorized") })
        }
        if (user_password.length < 6) return res.json({ success: false, message: req.t("Password must be at least 6 chars long") })
        const hash = await bcrypt.hash(user_password, 10)
        userObj.user_password = hash;
        userObj.user_token = ""
        userObj.save();

        return res.json({
            success: true,
            message: req.t('User password is reset successuflly')
        })
    } catch (err) {

        return res.json({ success: false, error: err.message })
    }

}


exports.forgotController = async (req, res) => {
    try {
        let { user_email } = req.body;

        user_email = user_email.toLowerCase()
        if (!user_email) {
            return res.json({
                success: false,
                message: req.t('user email must be required')
            })
        }

        const data = await user.findOne({ user_email: user_email, user_status: 'Active' })

        if (!data) {
            return res.json({
                success: false,
                message: req.t("user email is wrong")
            })
        }

        const token = jwt.sign({
            id: data._id
        }, 'secret', { expiresIn: 5 * 60 });


        data ? data.user_token = token : data.user_token;
        await data.save()
        forgotPassword(user_email, token, data.user_name)
        return res.json({ success: true, message: req.t('Please check your email') })
    }
    catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}


