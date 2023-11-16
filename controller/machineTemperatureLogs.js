const mongoose = require('mongoose')
const model = require('../model/machineTemperatureLogs')
const pagination = require('../utils/pagination')
exports.addTemperature = async (req, res, next, machine) => {
  try {
    const { machine_id, temperature } = req.body;

    let temperatureModel = await new model({
      machine_id,
      temperature,


    });
    await temperatureModel.save();

    res.status(200).json({
      success: true,
      message: req.t("Page is added successfully"),
      temperatureModel,
    });
  }
  catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}

exports.machineTemperatueLog = async (req, res, next) => {
  try {
    const { machine_id } = req.params;

    const data = await pagination(model.find({ machine_id: mongoose.Types.ObjectId(machine_id) }).populate({ path: 'machine_id', select: { machine_name: 1, machine_code: 1 } }), req)

    res.status(200).json({
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