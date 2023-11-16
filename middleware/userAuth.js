const jwt = require("jsonwebtoken");
const mongoose  = require("mongoose");
const userModel = require("../model/userModel");

const userAuth = async (req, res, next) => {
    try {
        if (!req.header("Authorization")) {
            return res.json({
                success: false,
                message: "Please pass token in header"
            })
        }
        const token = req.header("Authorization").replace("Bearer ", "");

        const verify = jwt.verify(token, "secret");
        const id = verify.data;
        if (!verify) {
            return res.json({ message: "User don't have accesss,please Login" });
        }

        const user = await userModel.findOne({_id:mongoose.Types.ObjectId(id),user_status:'Active'}).select({user_password:0})

        if (!user) {
            return res.json({
                success: false,
                message: 'No user found in Auth'
            })
        }

        req.user = user
        next()
    } catch (err) {
        res.json({ success: false, message: err.message, });
    }
};

module.exports = userAuth;
