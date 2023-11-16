const userModel = require("../model/userModel");
const mongoose = require('mongoose')

exports.addPoints = async (req, res, next) => {
  try {
    const {
      user_id,
      subsidy_points,
    } = req.body;

    const user = await userModel.findOne({ _id: mongoose.Types.ObjectId(user_id) })
    if (!user) {
      return res.json({
        success: false,
        message: 'user not found'
      })
    }
    subsidy_points ? user.subsidy_points = subsidy_points : ""
    await user.save();
    return res.json({
      success: true,
      message: 'subsidy point has been added into user account'
    })

  } catch (err) {
    return res.json({
      success: false,
      error: err,
      message: err.message
    })
  }
}


exports.getUserPoints = async (req, res, next) => {
  try {

    const { user_id } = req.params

    const user = await userModel.findOne({ _id: mongoose.Types.ObjectId(user_id) }).select({ user_name: 1, subsidy_points: 1 })
    if (!user) {
      return res.json({
        success: false,
        message: 'user not found'
      })
    }

    return res.json({
      success: true,
      data: user
    })

  } catch (err) {
    return res.json({
      success: false,
      message: err?.message,
      error: err
    })
  }

}

