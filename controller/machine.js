const res = require('express/lib/response');
const mongoose = require('mongoose');
const ErrorHandler = require('../utils/errorHandling')
const model = require('../model/verdering');
const channelModel = require('../model/channel')
const asyncCatchHandler = require('../middleware/catchAsyncError')
const canteenModel = require('../model/canteen')
const { mergeChannel } = require('./channel')
const axios = require('axios')
const pagination = require('../utils/pagination')
const temperatureModel = require('../model/machineTemperatureLogs')
const filter = require('../utils/filter')
const { logs } = require('../utils/logs');
const { channelStatusTranslation } = require('../utils/utils');

exports.addMachine = asyncCatchHandler(async (req, res, next) => {

  let { machine_name,
    canteen_id,
    machine_status,
    payment_method,
    machine_location,
    machine_temperature,
    column,
    rows } = req.body;

  rows ? rows = rows : rows = 5
  column ? column = column : column = 7

  const total_channel = rows * column;

  const canteenCheck = await canteenModel.findById({ _id: canteen_id })

  if (!canteenCheck) {
    return next(new ErrorHandler(req.t('Canteen not found'), 200))
  }
  const canteenCount = await model.find({ canteen_id: mongoose.Types.ObjectId(canteen_id) }).count();
  if (canteenCount > 3) {
    return res.json({
      success: false,
      message: req.t("You can't create new machine, you can create max 4 machine with one canteen")
    })
  }

  const machineModel = new model({
    machine_name,
    canteen_id,
    machine_code: canteenCount,
    machine_status,
    payment_method,
    machine_location,
    machine_channel_column: column,
    machine_channel_rows: rows,
    machine_temperature,
    machine_parent_id: req.user ? req.user._id : ""
  })
  const store = await machineModel.save();
  await logs(null, store._id, null, null, null, null, null, null, null, null, null, null, null, null, "Add machine", `${machine_name} machine has been added from ${req?.user?.user_name}`, req, res, next)

  let machineId = ""
  machineId = machineModel._id

  // let number = 0
  // let cn = 0
  // for (let i = 1; i <= rows; i++) {
  //   number = number + 10
  //   cn = number
  //   for (let j = 1; j <= column; j++) {
  //     cn = cn + 1
  //     const channelModel11 = await new channelModel({
  //       machine_id: machineId,
  //       row_number: i,
  //       channel_name: cn,
  //       channel_order: j,
  //       canteen_id
  //     })
  //     await channelModel11.save();

  //   }



  // }


  res.json({
    success: true,
    message: req.t('Vending Machine is created successfully'),
    machineModel
  })


});

exports.allMachine = asyncCatchHandler(async (req, res, next) => {
  const loginUser = req.user
  let f = {}
  if (req.query.canteen_id) {
    f = {
      ...f,
      canteen_id: req.query.canteen_id
    }
  }
  const allCanteen = await canteenModel.find({ $or: [{ canteen_parent_id: mongoose.Types.ObjectId(loginUser._id) }, { canteen_admin_id: mongoose.Types.ObjectId(loginUser._id) }] })
    .sort({ createdAt: -1 })

  let canteen_id = []
  if (allCanteen.length >= 1) {

    for (let i = 0; i < allCanteen.length; i++) {

      canteen_id.push(allCanteen[i]._id)

    }

  }
  let machine;
  if (loginUser.user_role == 'super_admin') {
    if (req.query.filter) {
      machine = await filter(model.find({
        ...f,
        machine_status: { $ne: "Deleted" },
        $or: [{ machine_status: new RegExp(req.query.filter, 'i') },
        { machine_name: new RegExp(req.query.filter, 'i') }]
      })
        .sort({ createdAt: -1 }), req)
    } else {
      machine = await pagination(model.find({ ...f, machine_status: { $ne: "Deleted" } }).populate('canteen_id')
        .sort({ createdAt: -1 }), req);
    }
  } else {
    if (req.query.filter) {
      machine = await filter(model.find({ ...f, machine_status: { $ne: "Deleted" }, canteen_id: { $in: canteen_id }, $or: [{ machine_status: new RegExp(req.query.filter, 'i') }, { machine_name: new RegExp(req.query.filter, 'i') }] })
        .sort({ createdAt: -1 }), req)
    } else {
      machine = await pagination(model.find({ ...f, machine_status: { $ne: "Deleted" }, canteen_id: { $in: canteen_id } }).populate('canteen_id')
        .sort({ createdAt: -1 }), req);
    }
  }


  res.json({
    success: true,
    totalRecord: machine.totalRecord,
    currentPage: machine.currentPage,
    totalPage: machine.totalPage,
    machine: machine.data,


  });
});

exports.listMachine = asyncCatchHandler(async (req, res, next) => {
  const { id } = req.params;

  const machineModel = await model.findOne({ _id: mongoose.Types.ObjectId(id) });


  res.json({
    success: true,
    machineModel,
  });
});
exports.listMachineByCanteenId = asyncCatchHandler(async (req, res, next) => {
  const { id } = req.params;

  const machineModel = await model.find({ canteen_id: id });


  res.json({
    success: true,
    machineModel,
  });
});

exports.deleteMachine = asyncCatchHandler(async (req, res, next) => {
  const { id } = req.params;

  const deleteModel = await model.findOneAndUpdate({ _id: mongoose.Types.ObjectId(id) }, { machine_status: "Deleted" });
  if (!deleteModel) {
    return next(new ErrorHandler(req.t("No vending machine found"), 200));
  }
  res.json({
    success: true,
    message: req.t("Machine is deleted successfully"),
  });
});

exports.updateMachine = asyncCatchHandler(async (req, res, next) => {
  const { id } = req.params;
  const { machine_name,
    canteen_id,
    payment_method,
    machine_location,
    machine_status,
    machine_temperature,

  } = req.body;



  const updateMachine = await model.findOne({ _id: mongoose.Types.ObjectId(id) });
  if (!updateMachine) {
    return next(new ErrorHandler(req.t("No vending machine found"), 200));
  }

  const canteenVerify = canteen_id ? await canteenModel.findOne({ _id: mongoose.Types.ObjectId(canteen_id), canteen_status: 'Active' }) : ""
  if (canteen_id && !canteenVerify) {
    return next(new ErrorHandler(req.t("Canteen not found"), 200));
  }
  const updatePayment = payment_method ? payment_method.length : ""
  canteen_id ? (updateMachine.canteen_id = canteen_id) : canteen_id;
  updatePayment ? updateMachine.payment_method = payment_method : updateMachine.payment_method;
  machine_location ? (updateMachine.machine_location = machine_location) : machine_location;
  machine_status ? (updateMachine.machine_status = machine_status) : machine_status;
  machine_name ? (updateMachine.machine_name = machine_name) : machine_name;
  machine_temperature ? (updateMachine.machine_temperature = machine_temperature) : machine_temperature;

  updateMachine.save();

  res.json({
    success: true,
    message: req.t("Machine is updated successfully"),
    updateMachine,
  });
});

// Update Machine Temperature
exports.updateMachineTemperature = asyncCatchHandler(async (req, res, next) => {
  const { machine_id } = req.params;

  const {
    machine_temperature
  } = req.body;
  const updateMachine = await model.findOne({ _id: mongoose.Types.ObjectId(machine_id) });
  if (!updateMachine) {
    return next(new ErrorHandler(req.t("No vending machine found"), 200));
  }

  if(machine_temperature) {
    updateMachine.requested_machine_temperature = machine_temperature;
    await updateMachine.save();
  }


  const canteenURL = await canteenModel.findOne({ _id: mongoose.Types.ObjectId(updateMachine.canteen_id) });

  if (canteenURL && canteenURL.end_point) {

    axios.get(`${canteenURL.end_point}/request-programming-working-temperature/0/${machine_temperature}`)
      .then(async data => {
        console.log(data.data)
        let temperatureModelData = await new temperatureModel({
          machine_id: updateMachine._id,
          machine_temperature: updateMachine.machine_temperature,
        });
        const store = await temperatureModelData.save();
        await logs(null, machine_id, null, null, null, null, null, null, null, null, store._id, null, null, null, "Update temperature", `In ${machine_id} machine, ${machine_temperature} temperature has been updated from ${req?.user?.user_name}`, req, res, next)


      }).catch(err => console.log("machine controller end point is not working"))
  }

  return res.json({
    success: true,
    message: req.t("Machine temperature is updated successfully"),
  });
});

/// Machine Controller: Update Temperature in Machine 

exports.updateTemperature = asyncCatchHandler(async (req, res, next) => {
  const {
    canteen_id,
    machine_code,
    machine_temperature
  } = req.body;
  const updateMachine = await model.findOne({ canteen_id: mongoose.Types.ObjectId(canteen_id), machine_code: parseInt(machine_code) });
  if (!updateMachine) {
    return res.json({
      success: false,
      message: 'machine not found'
    })

  }

  if(machine_temperature) {
    updateMachine.machine_temperature = machine_temperature.trim();
    await updateMachine.save();
    let temperatureModelData = await new temperatureModel({
      machine_id: updateMachine._id,
      machine_temperature: updateMachine.machine_temperature,
    });
    await temperatureModelData.save();
  }

  // await addTemperature(updateMachine._id,updateMachine.machine_name,updateMachine.machine_code,machine_temperature)
  return res.json({
    success: true,
    message: req.t("Machine temperature is updated successfully"),
  });
});

exports.updateMachineProgrammingTimingWait = asyncCatchHandler(async (req, res, next) => {
  const { machine_id } = req.params;

  const {
    programming_time_wating_for_product_collection
  } = req.body;
  console.log('req.body', req.body);
  const updateMachine = await model.findOne({ _id: mongoose.Types.ObjectId(machine_id) });
  if (!updateMachine) {
    return next(new ErrorHandler(req.t("No vending machine found"), 200));
  }

  console.log('programming_time_wating_for_product_collection',programming_time_wating_for_product_collection);
  programming_time_wating_for_product_collection ? (updateMachine.programming_time_wating_for_product_collection = programming_time_wating_for_product_collection) : 1;

  await updateMachine.save();

  const canteenURL = await canteenModel.findOne({ _id: mongoose.Types.ObjectId(updateMachine.canteen_id) });

  if (canteenURL && canteenURL.end_point) {

    axios.get(`${canteenURL.end_point}/request-programming-time-waiting/${programming_time_wating_for_product_collection}`)
      .then(async data => {
        console.log(data.data)
        
      }).catch(err => console.log("machine controller end point is not working"))
  }

  return res.json({
    success: true,
    message: req.t("Machine timing wait has been updated successfully"),
  });
});

////   Display Machine Product In admin side

exports.allMachineProductAdminSide = asyncCatchHandler(
  async (req, res, next) => {
    const { machine_id } = req.params;

    let product = await model.aggregate([
      {
        $unwind: {
          path: "$channel",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "inventories",
          localField: "channel._id",
          foreignField: "channel_id",
          as: "inventories",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "channel.assign_product",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $project: {
          name: 1,
          canteenId: 1,
          Machine_Code: 1,
          status: 1,
          channel: 1,
          inventoryies: 1,
          product: 1,
        },
      },
      {
        $group: {
          _id: {
            _id: "$channel.assign_product",
            machine_name: "$name",
            canteenId: "$canteenId",
            Machine_Code: "$Machine_Code",
          },
          Assigned: {
            $sum: "$channel.quantity",
          },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id._id",
          foreignField: "_id",
          as: "products",
        },
      },
      {
        $match: {
          products: {
            $ne: [],
          },
        },
      },
      {
        $unwind: {
          path: "$products",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: "$_id",
          Assigned: 1,
          products: 1,
          channel: 1,
          TotalProduct: {
            $add: ["$Assigned", "$products.quantity"],
          },
        },
      },
    ]);

    return res.json({
      success: true,
      product,
    });
  }
);


///  Display Machine Product

exports.displayMachineProduct = asyncCatchHandler(async (req, res, next) => {
  const { machine_id } = req.params;

  let product = await model
    .findById({ _id: machine_id }, { "channel.assign_product.quantity": 0 })
    .populate({
      path: "canteenId",
      select: { _id: 1, name: 1, location: 1, status: 1 },
    })
    .populate({
      path: "channel.assign_product",
      select: {
        _id: 1,
        name: 1,
        price: 1,
        description: 1,
        image: 1,
        recipe: 1,
        allergic: 1,
        VAT: 1,
        expiry_date: 1,
        status: 1,
      },
    });

  return res.json({
    success: true,
    product,
  });
});

exports.requestMachineStatusFromMachine = asyncCatchHandler(async (req, res, next) => {
  console.log(req.params);
  const machine_id = req.params.machine_id;
  const canteen_id = req.params.canteen_id;

  if (machine_id && canteen_id) {
    let canteenAggregate = [
      {
        '$match': {
          '_id': new mongoose.Types.ObjectId(canteen_id)
        }
      }, {
        '$project': {
          'canteen_endpoint': '$end_point'
        }
      }
    ];
    let canteen_endpoint = await canteenModel.aggregate(canteenAggregate).exec();
    console.log('canteen_endpoint', canteen_endpoint);
    if (canteen_endpoint?.length) {

      const machine = await model.findById(machine_id).exec();
      console.log('machine', machine);
      if (machine) {
        await axios.get(`${canteen_endpoint[0].canteen_endpoint}/status-of-machine-request-from-cloud/${machine.machine_code}`);
      }

    }

    res.send("ok");

  } else {
    res.status('200').json({
      success: false,
      message: 'Please provide all the required parameters'
    });
  }
});

//The machine controller will update the channel status every few minutes whenever
//there is an update to give.
exports.updateMachineStatus = asyncCatchHandler(async (req, res, next) => {
  console.log('req.params', req.params);
  const canteen_id = req.params.canteen_id;
  const machine_number = req.params.machine_number;
  const machine_status = req.params.machine_status;
  const door_status = req.params.door_status;
  const light_status = req.params.light_status;
  const machine_communication_status = req.params.machine_communication_status;
  const dispense_status = req.params.dispense_status;
  const temperature = req.params.temperature;

  if (canteen_id && machine_number && machine_status && door_status && light_status) {
    model.findOneAndUpdate({ 
      canteen_id: new mongoose.Types.ObjectId(canteen_id),
      machine_code: machine_number },
      { $set: { 
        machine_service_status: machine_status, 
        door_status: door_status, 
        light_status: light_status, 
        machine_communication_status: machine_communication_status,
        machine_dispense_status: dispense_status,
        machine_temperature: temperature
       } }).exec();

    res.status('200').json({
      success: true,
      message: 'Data Updated'
    })

  } else {
    res.status('200').json({
      success: false,
      message: 'Please provide all the required parameters'
    });
  }
});

//The cloud will send a request to the machine to turn on/off the light
exports.updateMachineLightStatus = asyncCatchHandler(async (req, res, next) => {
  console.log('req.params', req.params);
  const canteen_id = req.params.canteen_id;
  const machine_id = req.params.machine_id;
  const light_status = req.params.light_status;

  if (canteen_id && machine_id && light_status) {
    let canteenAggregate = [
      {
        '$match': {
          '_id': new mongoose.Types.ObjectId(canteen_id)
        }
      }, {
        '$project': {
          'canteen_endpoint': '$end_point'
        }
      }
    ];
    let canteen_endpoint = await canteenModel.aggregate(canteenAggregate).exec();
    if (canteen_endpoint?.length) {

      const machine = await model.findById(machine_id).exec();
      console.log('machine', machine);
      if (machine) {
        const light = light_status === 'on' ? '1' : '0';
        await axios.get(`${canteen_endpoint[0].canteen_endpoint}/light/${machine.machine_code}/${light}`);
      }

    }

    res.status('200').json({
      success: true,
      message: 'Data Updated'
    })

  } else {
    res.status('200').json({
      success: false,
      message: 'Please provide all the required parameters'
    });
  }
});

exports.getMachineData = asyncCatchHandler(async (req, res, next) => {
  const machine_id = req.params.machine_id;

  if (machine_id) {
    let machine = await model.findById(machine_id).exec();
    if (machine) {
      machine = await model.find({ canteen_id: machine.canteen_id }).exec();
      res.status('200').json({
        success: true,
        data: machine
      })
    } else {
      res.status('200').json({
        success: false,
        message: 'Machine not found'
      });
    }
  } else {
    res.status('200').json({
      success: false,
      message: 'Please provide all the required parameters'
    });
  }

});

exports.sendRequestChannelsScanDataForMachine = asyncCatchHandler(async (req, res, next) => {
  console.log(req.params);
  const machineId = req.params.machine_id;
  if(machineId) {
      let machine = await model.findById(machineId).exec();
      if (machine) {
        let canteenAggregate = [
          {
            '$match': {
              '_id': new mongoose.Types.ObjectId(machine.canteen_id)
            }
          }, {
            '$project': {
              'canteen_endpoint': '$end_point'
            }
          }
        ];
        let canteenEndpoint = await canteenModel.aggregate(canteenAggregate).exec();
        console.log('canteenEndpoint',canteenEndpoint);
        if (canteenEndpoint?.length && canteenEndpoint[0]?.canteen_endpoint) {
          console.log(`${canteenEndpoint[0].canteen_endpoint}/scan-channels-on-machine-from-cloud/${machine.machine_code}`);
          await axios.get(`${canteenEndpoint[0].canteen_endpoint}/scan-channels-on-machine-from-cloud/${machine.machine_code}`);
          res.status('200').json({
            success: true,
            message: 'Request sent'
          });
        } else {
          res.status('200').json({
            success: false,
            message: 'Canteen endpoint not found'
          });
        }
      
      } else {
        res.status('200').json({
          success: false,
          message: 'Machine not found'
        });
      }
    
    } else {
      res.status('200').json({
        success: false,
        message: 'Please provide all the required parameters'
      });
    }
});

exports.resetPercentageChannelsStatusValue = asyncCatchHandler(async (req, res, next) => {

});

exports.getChannelsMapping = asyncCatchHandler(async (req, res, next) => {
  const machineId = req.params.machine_id;
  if(machineId) {
    let machine = await model.findById(machineId).exec();
    if (machine) {
      let canteenAggregate = [
        {
          '$match': {
            '_id': new mongoose.Types.ObjectId(machine.canteen_id)
          }
        }, {
          '$project': {
            'canteen_endpoint': '$end_point'
          }
        }
      ];
      let canteenEndpoint = await canteenModel.aggregate(canteenAggregate).exec();
      if (canteenEndpoint?.length && canteenEndpoint[0]?.canteen_endpoint) {
        const response = await axios.get(`${canteenEndpoint[0].canteen_endpoint}/get-channels-mapping/${machine.machine_code}`);
        console.log('response', response.data);
        if(response && response.data && response.data.success) {

          if(response.data.channels && response.data.channels.length) {
            const channelsTrays = response.data.channels;
            let trayNumber = 10;
            let channelNumber = 0;
            let tn = 0;
            let tn1 = 0;
            let cn = 0;
            let cn1 = 0;
            let incrementTrayNumber = false;
            for(let tray of channelsTrays) {
              channelNumber = trayNumber;
              cn = 0;
              cn1 = 0;
              for(let channel of tray) {
                console.log('channel',channel);
                if(channel.channelStatus > 0 ) {
                  incrementTrayNumber = true;
                  await new channelModel({
                            machine_id: machineId,
                            row_number: ((channelNumber/10) -1) + 1,
                            channel_name: channelNumber+cn1,
                            channel_order: cn1,
                            canteen_id: machine.canteen_id._id,
                            mapped_tray_number: tn+11,
                            mapped_channel_number: cn,
                            channel_machine_status: channelStatusTranslation(channel.channelStatus),
                          }).save();
                  cn1 += 1;
                }
                cn += 1;
              }
              
              if(incrementTrayNumber) {
                trayNumber += 10;
                tn1 =+ 1;
              }
              incrementTrayNumber = false;
              tn += 1;

            }
            
            await model.updateOne({ _id: mongoose.Types.ObjectId(machineId) }, { $set: { percentageOfChannelsStatusUpdated: 0 } }).exec();
                      
            res.status('200').json({
              success: true,
              channels: channelsTrays
            });

           } else {
            res.status('200').json({
              success: false,
              message: 'Channels not found'
            });
           }

        } else {
          res.status('200').json({
            success: false,
            message: 'Channels not found'
          });
        }
      } else {
        res.status('200').json({
          success: false,
          message: 'Canteen endpoint not found'
        });
      }
    
    } else {
      res.status('200').json({
        success: false,
        message: 'Machine not found'
      });
    }
  } else {
    res.status('200').json({
      success: false,
      message: 'Please provide a valid machine id'
    });
  }
});

exports.updateChannelsMappingInExistingChannels = asyncCatchHandler(async (req, res, next) => {
  const machineId = req.params.machine_id;
  if(machineId) {
    let machine = await model.findById(machineId).exec();
    if (machine) {
      let canteenAggregate = [
        {
          '$match': {
            '_id': new mongoose.Types.ObjectId(machine.canteen_id)
          }
        }, {
          '$project': {
            'canteen_endpoint': '$end_point'
          }
        }
      ];

      let canteenEndpoint = await canteenModel.aggregate(canteenAggregate).exec();
      if (canteenEndpoint?.length && canteenEndpoint[0]?.canteen_endpoint) {
        const response = await axios.get(`${canteenEndpoint[0].canteen_endpoint}/get-channels-mapping/${machine.machine_code}`);
        if(response && response.data && response.data.success) {
          // console.log('updateChannelsMappingInExistingChannels', response.data);
          if(response.data.channels && response.data.channels.length) {
            const channelsTrays = response.data.channels;
            console.log('channelsTrays', channelsTrays);

            const channelObjs = await channelModel.find({
               machine_id: mongoose.Types.ObjectId(machineId), 
               channel_status: 'Active'})
               .sort({channel_name: 1})
               .exec();
            console.log('channelObjs', channelObjs);
            const productsData = [];
            if(channelObjs) {
              channelObjs.forEach((channelObj) => {
                // channelObj.channel_status = 'Deleted';
                // channelObj.save();
                productsData.push({
                  channel_name: channelObj.channel_name,
                  channel_product_id: channelObj.channel_product_id,
                  channel_product_quantity: channelObj.channel_product_quantity,
                  channel_product_threshold: channelObj.channel_product_threshold,
                  channel_extraction_time: channelObj.channel_extraction_time,
                  channel_product_limit: channelObj.channel_product_limit,
                  dispensing_speed: channelObj.dispensing_speed,
                });
                channelModel.updateOne({
                   _id: mongoose.Types.ObjectId(channelObj._id) }, 
                   { $set: {
                     channel_status: 'Deleted' 
                    } }
                ).exec();
  
               });
  
               console.log('pre productsData',productsData);
               
  
              let trayNumber = 10;
              let channelNumber = 0;
              let tn = 0;
              let tn1 = 0;
              let cn = 0;
              let cn1 = 0;
              let incrementTrayNumber = false;
              for(let tray of channelsTrays) {
                channelNumber = trayNumber;
                cn = 0;
                cn1 = 0;
                for(let channel of tray) {
                  console.log('channel',channel);
                  if(channel.channelStatus > 0 ) {
                    incrementTrayNumber = true;
                    const productToRestore = productsData.find(prod => prod.channel_name === (channelNumber+cn1));
                    // if(productToRestore) {
                      await new channelModel({
                                machine_id: machineId,
                                row_number: ((channelNumber/10) -1) + 1,
                                channel_name: channelNumber+cn1,
                                channel_order: cn1,
                                canteen_id: machine.canteen_id._id,
                                mapped_tray_number: tn+11,
                                mapped_channel_number: cn,
                                channel_machine_status: channelStatusTranslation(channel.channelStatus),
                                channel_product_id: productToRestore.channel_product_id || null,
                                channel_product_quantity: productToRestore.channel_product_quantity || 0,
                                channel_product_threshold: productToRestore.channel_product_threshold || 0,
                                channel_extraction_time: productToRestore.channel_extraction_time || 0,
                                channel_product_limit: productToRestore.channel_product_limit || 0,
                                dispensing_speed: productToRestore.dispensing_speed || 0,
                              }).save();
  
                              if(productToRestore) {delete productToRestore;}
                    // }
                    cn1 += 1;
                  }
                  cn += 1;
                }
  
                
                if(incrementTrayNumber) {
                  trayNumber += 10;
                  tn1 =+ 1;
                }
                incrementTrayNumber = false;
                tn += 1;
  
              }
  
             console.log('post productsData',productsData);


            }
            
            await model.updateOne({ 
              _id: mongoose.Types.ObjectId(machineId) 
            }, { $set: { 
              percentageOfChannelsStatusUpdated: 0 
            } })
            .exec();
                      
            res.status('200').json({
              success: true,
              channels: response.data.channels
            });

           } else {
            res.status('200').json({
              success: false,
              message: 'Channels not found'
            });
           }

        } else {
          res.status('200').json({
            success: false,
            message: 'Channels not found'
          });
        }
      } else {
        res.status('200').json({
          success: false,
          message: 'Canteen endpoint not found'
        });
      }
    
    } else {
      res.status('200').json({
        success: false,
        message: 'Machine not found'
      });
    }
  } else {
    res.status('200').json({
      success: false,
      message: 'Please provide a valid machine id'
    });
  }

});

exports.requestForResetFaults = asyncCatchHandler(async (req, res, next) => {
  const machineId = req.params.machine_id;
  if(machineId) {
    let machine = await model.findById(machineId).exec();
    if (machine) {
      let canteenAggregate = [
        {
          '$match': {
            '_id': new mongoose.Types.ObjectId(machine.canteen_id)
          }
        }, {
          '$project': {
            'canteen_endpoint': '$end_point'
          }
        }
      ];
      let canteenEndpoint = await canteenModel.aggregate(canteenAggregate).exec();
      if (canteenEndpoint?.length && canteenEndpoint[0]?.canteen_endpoint) {
        const response = await axios.get(`${canteenEndpoint[0].canteen_endpoint}/request-for-reset-faults/${machine.machine_code}`);
        console.log('response', response.data);
        if(response && response.data && response.data.success) {

          if(response.data.channels && response.data.channels.length) {
              
            res.status('200').json({
              success: true,
              message: 'Request Sent'
            });

           } else {
            res.status('200').json({
              success: false,
              message: 'Channels not found'
            });
           }

        } else {
          res.status('200').json({
            success: false,
            message: 'Channels not found'
          });
        }
      } else {
        res.status('200').json({
          success: false,
          message: 'Canteen endpoint not found'
        });
      }
    
    } else {
      res.status('200').json({
        success: false,
        message: 'Machine not found'
      });
    }
  } else {
    res.status('200').json({
      success: false,
      message: 'Please provide a valid machine id'
    });
  }

});


exports.readRequestForMachineFaults = asyncCatchHandler(async (req, res, next) => {
  const machineId = req.params.machine_id;
  if(machineId) {
    let machine = await model.findById(machineId).exec();
    if (machine) {
      let canteenAggregate = [
        {
          '$match': {
            '_id': new mongoose.Types.ObjectId(machine.canteen_id)
          }
        }, {
          '$project': {
            'canteen_endpoint': '$end_point'
          }
        }
      ];
      let canteenEndpoint = await canteenModel.aggregate(canteenAggregate).exec();
      if (canteenEndpoint?.length && canteenEndpoint[0]?.canteen_endpoint) {
        const response = await axios.get(`${canteenEndpoint[0].canteen_endpoint}/request-fault-of-machine/${machine.machine_code}`);
        console.log('response', response.data);
        if(response && response.data && response.data.success) {

          if(response.data.faults && response.data.faults.length) {
              console.log(response.data);
              console.log(response.data.faults);
              res.status('200').json({
                success: true,
                faults: response.data.faults
              });

           } else {
            res.status('200').json({
              success: false,
              message: 'Faults not found'
            });
           }

        } else {
          res.status('200').json({
            success: false,
            message: 'Faults not found'
          });
        }
      } else {
        res.status('200').json({
          success: false,
          message: 'Canteen endpoint not found'
        });
      }
    
    } else {
      res.status('200').json({
        success: false,
        message: 'Machine not found'
      });
    }
  } else {
    res.status('200').json({
      success: false,
      message: 'Please provide a valid machine id'
    });
  }

});