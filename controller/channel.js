
const mongoose = require('mongoose');
const axios = require('axios')
var cron = require('node-cron');
require('dotenv').config();

const ErrorHandler = require('../utils/errorHandling');
const { logs } = require('../utils/logs');
const user = require("../model/userModel");
const machine_model = require('../model/verdering');
const product_model = require('../model/product');
const canteenModel = require("../model/canteen");
const asyncCatchHandler = require('../middleware/catchAsyncError')
const wastageModel = require('../model/wastage')
const model = require('../model/channel');

const sgMail = require('@sendgrid/mail');
const channel = require('../model/channel');
const sendGridApi = process.env.USER_API;
require('dotenv').config();
sgMail.setApiKey(sendGridApi);

exports.addChannel = asyncCatchHandler(async (req, res, next) => {
    const { machine_id } = req.params;

    const { channel_product_limit, row_number, channel_status, channel_product_id, channel_product_quantity, channel_product_threshold, channel_extraction_time, dispensing_speed, programming_time_wating_for_product_collection } = req.body
    const { channel_position, position } = req.body


    const machineModel = await machine_model.findOne({ _id: mongoose.Types.ObjectId(machine_id), machine_status: 'Active' })
    const productModel = await product_model.findOne({ _id: mongoose.Types.ObjectId(channel_product_id), product_status: 'Active' })

    if (!productModel) {
        return next(new ErrorHandler(req.t('product not found'), 200))
    }

    if (!machineModel) {
        return next(new ErrorHandler(req.t('Machine not found'), 200))
    }
    if (channel_product_quantity && +channel_product_quantity > +channel_product_limit) {
        return next(new ErrorHandler(req.t('product quantity must be less or equal to channel product limit'), 422))
    }
    var canteen_id = machineModel.canteen_id
    const rowCount = await model.aggregate(
        [{
            $match: {
                machine_id: mongoose.Types.ObjectId(machine_id),
                row_number: Number(row_number),
                $or: [
                    {
                        channel_status: 'Active'
                    },
                    {
                        channel_status: 'InActive'
                    },
                    {
                        channel_status: 'merged'
                    }
                ]
            }
        }])

    if (rowCount.length >= 10) {
        return next(new ErrorHandler(req.t('Channel limit already filled'), 200))
    }

    const dataname = await model.findOne({ machine_id: mongoose.Types.ObjectId(machine_id), row_number: row_number, channel_status: 'Active' }).sort({ channel_order: 1 }).limit(1)
    if (!dataname) {
        return next(new ErrorHandler(req.t('Channel row not found'), 200))
    }
    // return(res.json(dataname))    
    let channel_get_name = dataname.channel_name
    let channel_order = dataname.channel_order
    if (position == "start") {

        await model.updateMany({ machine_id: mongoose.Types.ObjectId(machine_id), row_number: row_number }, { $inc: { channel_order: 1 } })
        await model.updateMany({ machine_id: mongoose.Types.ObjectId(machine_id), row_number: row_number, channel_name: { $gte: channel_get_name } }, { $inc: { channel_name: 1 } })
        const channelModel = await new model({
            machine_id,

            row_number,
            channel_name: channel_get_name,
            channel_status,
            channel_product_id,
            channel_product_quantity,
            channel_product_threshold,
            channel_extraction_time,
            channel_width: 1,
            channel_order: channel_order,
            canteen_id,
            channel_product_limit,
            dispensing_speed,
            programming_time_wating_for_product_collection
        })
        const store = await channelModel.save()
        await logs(null, null, null, null, null, null, null, store._id, null, null, null, null, null, null, "Add channel", `${channel_get_name} channel has been added from ${req?.user?.user_name}`, req, res, next)

        return res.json({
            success: true,
            message: req.t('Channel is added successfully'),

        })
    }
    if (position == "end") {
        const add_end = await model.find({ machine_id: mongoose.Types.ObjectId(machine_id), row_number: row_number, $or: [{ channel_status: 'Active' }, { channel_status: 'merged' }] }).sort({ channel_order: -1 }).limit(1)
        //   const data=await model.find({$or:[{channel_status:'Active'},{channel_status:'merged'}],machine_id:mongoose.Types.ObjectId(machine_id),row_number:row_number})
        //   .sort({channel_order:-1}).limit(1)
        //     return res.json({end:data[0].channel_order})
        const dataGet = await model.findOne({ machine_id: mongoose.Types.ObjectId(machine_id), row_number: row_number, channel_status: 'Active' }).sort({ channel_order: -1 }).limit(1)

        //  return(res.json(dataGet.channel_order+3))  
        const get_channel_name = dataGet.channel_name
        await model.updateMany({ machine_id: mongoose.Types.ObjectId(machine_id), channel_name: { $gt: get_channel_name }, row_number: row_number }, { $inc: { channel_name: 1 } })

        const channelModel = await new model({
            machine_id,

            row_number,
            channel_name: Number(get_channel_name) + 1,
            channel_status,
            channel_product_id,
            channel_product_quantity,
            channel_product_threshold,
            channel_extraction_time,
            channel_width: 1,
            channel_order: Number(dataGet.channel_order + 1),
            canteen_id,
            dispensing_speed
        })
        await channelModel.save()
        return res.json({
            success: true,
            message: req.t('Channel is added successfully'),

        })
    }
    if (!channel_position) {
        return next(new ErrorHandler([{ msg: req.t('Channel position must be required'), param: 'channel_position' }], 422))
    }

    const column_position = await model.findOne({ machine_id: mongoose.Types.ObjectId(machine_id), _id: mongoose.Types.ObjectId(channel_position), channel_status: 'Active', row_number: Number(row_number) })

    if (!column_position) {
        return next(new ErrorHandler(req.t('Channel position not found'), 200))
    }
    const order_number = column_position.channel_order
    const channel_get_name1 = column_position.channel_name;

    //  return res.json(channel_get_name)  
    await model.updateMany({ machine_id: mongoose.Types.ObjectId(machine_id), channel_name: { $gt: channel_get_name1 }, row_number: row_number }, { $inc: { channel_name: 1 } })

    await model.updateMany({ channel_order: { $gt: order_number }, row_number: row_number, machine_id: mongoose.Types.ObjectId(machine_id) }, { $inc: { channel_order: 1 } })
    const channelModel = await new model({
        machine_id,

        row_number,
        channel_name: channel_get_name1 + 1,
        channel_status,
        channel_product_id,

        channel_product_quantity,
        channel_product_threshold,
        channel_extraction_time,
        channel_width: 1,
        channel_order: order_number + 1,
        canteen_id,
        dispensing_speed
    })
    await channelModel.save()



    return res.json({
        success: true,
        message: req.t('Channel is added successfully'),

    })
})

exports.mergeChannel = asyncCatchHandler(async (req, res, next) => {
    const { machine_id, merge_with } = req.params;
    const { merge_to } = req.body
    if (merge_to.length < 1) {
        return next(new ErrorHandler(req.t('merge channel id must be required'), 422))
    }
    let data = []

    for (let a in merge_to) {
        let abc = await model.findOne({
            machine_id: mongoose.Types.ObjectId(machine_id),
            _id: mongoose.Types.ObjectId(merge_to[a]),
            channel_status: 'Active'
        })

        if (!abc) {
            return next(new ErrorHandler(req.t(`This channel id not found in database`), 200))
        }
        if (abc.channel_product_quantity >= 1) {

            return next(new ErrorHandler(req.t(`You can't merge this channels its already have product quantity`), 200))
        }

        data.push(abc._id)
    }

    const mergedNumber = Number(data.length)
    for (let a in merge_to) {
        await model.findOneAndUpdate({
            machine_id: mongoose.Types.ObjectId(machine_id),
            _id: mongoose.Types.ObjectId(merge_to[a])
        }, {
            channel_status: 'merged',
            //   merge_channel: merge_with 
        })


    }

    const data1 = await model.findOne({
        _id: mongoose.Types.ObjectId(merge_with)
    })

    if (!data1) {
        return next(new ErrorHandler(req.t(`channel id not found in database`), 200))
    }

    data1 ? data1.channel_width = data1.channel_width + mergedNumber : channel_width;
    for (let a in data) {
        data1 ? data1.merge_channel = [...data1.merge_channel, data[a]] : data1.merge_channel
    }

    await data1.save()




    return res.json({
        success: true,
        message: req.t('Channel is merged successfully'),

    })

})

/// Display Channel

exports.displayMachineChannel = asyncCatchHandler(async (req, res, next) => {

    const { machine_id } = req.params;


    const machineModel = await model.aggregate([{
        $match: {
            machine_id: mongoose.Types.ObjectId(machine_id),
            $or: [{ channel_status: 'Active' },
            { channel_status: 'InActive' }]
        }
    }, {
        $lookup: {
            from: 'machines',
            localField: 'machine_id',
            foreignField: '_id',
            as: 'machine'
        }
    }, {
        $unwind: {
            path: '$machine',
            preserveNullAndEmptyArrays: true
        }
    }, {
        $lookup: {
            from: 'products',
            localField: 'channel_product_id',
            foreignField: '_id',
            as: 'products'
        }
    }, {
        $unwind: {
            path: '$products',
            preserveNullAndEmptyArrays: true
        }
    }, {
        $sort: {
            row_number: -1,
            channel_order: 1
        }
    }]);

    res.json({
        success: true,
        channel: machineModel
    })
})


exports.deleteMachineChannel = asyncCatchHandler(async (req, res, next) => {

    const { channel_id, machine_id, row_number } = req.params;

    if (!row_number) {
        return next(new ErrorHandler(req.t("row number must be required"), 422))
    }
    const channelCheck = await model.find({
        machine_id: machine_id, row_number: row_number,

        $or: [{ channel_status: 'Active' }, { channel_status: 'merged' }]
    })
    if (channelCheck && channelCheck.length < 1) {
        return next(new ErrorHandler(req.t("Channel not found"), 422))
    }
    if (channelCheck && channelCheck.length <= 1) {
        return next(new ErrorHandler(req.t("you can't delete this channel , row must have atleast one column"), 422))
    }

    const channel = await model.findOne({ _id: mongoose.Types.ObjectId(channel_id), machine_id: mongoose.Types.ObjectId(machine_id), row_number: row_number, channel_status: 'Active' })

    if (!channel) {
        return next(new ErrorHandler(req.t('Channel not found'), 422))
    }

    if (channel && channel.merge_channel.length >= 1) {
        return next(new ErrorHandler(req.t('Please unmerge channels for delete'), 200))
    }
    if (channel.channel_product_quantity >= 1) {
        return next(new ErrorHandler(req.t("you can't delete this channel,Channel have already products"), 200))
    }
    channel ? channel.channel_status = "Deleted" : channel.channel_status
    await channel.save()
    const channel_get_name2 = channel.channel_name
    await model.updateMany({ machine_id: mongoose.Types.ObjectId(machine_id), row_number: row_number, channel_name: { $gt: channel_get_name2 } }, { $inc: { channel_name: -1 } })
    res.json({
        success: true,
        message: req.t('Channel is Deleted successfully')
    })
})
exports.updateMachineChannel = asyncCatchHandler(async (req, res, next) => {
    const { channel_id } = req.params;
    const { merge, channel_product_limit, channel_product_threshold, channel_product_id, channel_extraction_time, channel_status, channel_product_quantity, dispensing_speed, programming_time_wating_for_product_collection } = req.body
    const { merge_to } = req.body

    // const data = await model.findOne({ machine_id: machine_id })
    const verifyProduct = channel_product_id && await product_model.findOne({ _id: mongoose.Types.ObjectId(channel_product_id), product_status: 'Active' })
    if (channel_product_id && !verifyProduct) {
        return next(new ErrorHandler(req.t('Product not found'), 200))
    }
    const channel = await model.findOne({ _id: mongoose.Types.ObjectId(channel_id), $or: [{ channel_status: 'Active' }, { channel_status: 'InActive' }] })
    if (!channel) {
        return next(new ErrorHandler(req.t('Channel not found'), 200))
    }

    // console.log(channel.channel_product_quantity!=,"ss")
    if (channel_product_quantity && (channel.channel_product_quantity != channel_product_quantity) && (+channel_product_quantity > +channel_product_limit)) {
        return next(new ErrorHandler(req.t('product quantity must be less or equal to channel product limit'), 422))
    }

    if (channel && channel_product_id && channel.channel_product_quantity >= 1 && channel.channel_product_id != channel_product_id) {
        return res.json({
            success: false,
            // message:`You can't update product ,channel has already ${channel.channel_product_quantity} products`
            message: req.t(`You can't update product ,channel has already other products`)

        })
    }
    if (merge_to && merge_to.length > 0) {

        if (merge_to && merge_to.length < 1) {
            return next(new ErrorHandler(req.t('merge channel id must be required'), 422))
        }
        let data = []

        for (let a in merge_to) {

            let abc = await model.findOne({

                _id: mongoose.Types.ObjectId(channel_id),
                channel_status: 'Active'
            })

            if (!abc) {
                return next(new ErrorHandler(req.t(`This channel id not found in database`), 200))
            }

            if (abc.channel_product_quantity >= 1) {

                return next(new ErrorHandler(req.t(`You can't merge this channels its already have product quantity`), 200))
            }

            data.push(abc._id)
        }

        const mergedNumber = Number(data.length)
        for (let a in merge_to) {
            await model.findOneAndUpdate({

                _id: mongoose.Types.ObjectId(merge_to[a])
            }, {
                channel_status: 'merged',
                //   merge_channel: merge_with 
            })


        }

        const data1 = await model.findOne({
            _id: mongoose.Types.ObjectId(channel_id)
        })

        if (!data1) {
            return next(new ErrorHandler(req.t(`Channel not found`), 200))
            // return next(new ErrorHandler(`This channel id ${merge_to[a]} not found in database`, 404))
        }

        data1 ? data1.channel_width = data1.channel_width + mergedNumber : channel_width;
        for (let a in merge_to) {
            data1 ? data1.merge_channel = [...data1.merge_channel, merge_to[a]] : data1.merge_channel
        }

        await data1.save()





    }
    channel_product_id ? channel.channel_product_id = channel_product_id : channel.channel_product_id;
    channel_product_threshold ? channel.channel_product_threshold = channel_product_threshold : channel.channel_product_threshold;
    channel_extraction_time ? channel.channel_extraction_time = channel_extraction_time : channel.channel_extraction_time;
    channel_status ? channel.channel_status = channel_status : channel.channel_status;
    channel_product_limit ? channel.channel_product_limit = channel_product_limit : channel.channel_product_limit;
    channel_product_quantity ? channel.channel_product_quantity = channel_product_quantity : channel_product_quantity;
    dispensing_speed ? channel.dispensing_speed = dispensing_speed : channel.dispensing_speed;
    programming_time_wating_for_product_collection? channel.programming_time_wating_for_product_collection = programming_time_wating_for_product_collection: channel.programming_time_wating_for_product_collection;
    
    await channel.save();
    return res.json({
        success: true,
        message: req.t('Channel is updated successfully'),

    })




})

exports.unMergeMachineChannel = asyncCatchHandler(async (req, res, next) => {

    const { channel_id } = req.params;
    const channel = await model.findById({ _id: mongoose.Types.ObjectId(channel_id) })

    if (!channel) {
        return next(new ErrorHandler(req.t("Channel not found"), 200))
    }
    // channel.merge_channel
    if (channel.merge_channel.length < 1) {
        return next(new ErrorHandler(req.t("This channel don't have merge channel"), 200))
    }
    const subChannel = channel.merge_channel
    // return res.json(subChannel)
    for (let a in subChannel) {
        const data = await model.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(subChannel[a]) }, {
            channel_status: 'Active'
        })

    }
    channel ? channel.merge_channel = [] : channel.merge_channel;
    channel ? channel.channel_width = 1 : channel.channel_width
    await channel.save()
    return res.json({
        success: true,
        message: req.t('channel is un_merged successfully')
    })

})

exports.deleteMachineRow = asyncCatchHandler(async (req, res, next) => {

    const { machine_id, row_number } = req.params;
    const { wastage } = req.query

    if (!row_number) {
        return next(new ErrorHandler(req.t("row number must be required"), 422))
    }
    const machine = await machine_model.findOne({ _id: mongoose.Types.ObjectId(machine_id) })
    if (!machine) {
        return res.json({
            success: false,
            message: req.t('Machine not found')
        })
    }
    let isCheck = false
    const data1 = await model.aggregate([{
        $match: {
            machine_id: mongoose.Types.ObjectId(machine_id),
            channel_status: 'Active'
        }
    }, {
        $group: {
            _id: '$row_number',
            Totdal: {
                $push: {
                    row_number: '$row_number'
                }
            }
        }
    }, { $project: { _id: 1 } }])
    //    const data1=await model.distinct('row_number',{channel_status:'Active'})
    //   return res.json({data:data1})

    /// Checked If row number not matched
    data1 && data1.map(data => {
        if (data._id == row_number) {
            isCheck = true
        }
    })

    if (!isCheck) {
        return next(new ErrorHandler(req.t("row number not found"), 200))
    }
    if (data1 && data1.length <= 1) {
        return next(new ErrorHandler(req.t("You can't delete this row,machine must have atleast 1 row"), 200))
    }
    //
    const channelCheck = await model.find({
        row_number: row_number, machine_id: mongoose.Types.ObjectId(machine_id),
        channel_product_quantity: { $gt: 0 }
    })


    // if(channelCheck.length>=1){
    //    return res.json({
    //         success: false,
    //         message:`${channelCheck.length} Channel have already product in this Row. Please remove it to delete complete row.`,
    //         data:channelCheck
    //     })
    // }
    if (wastage == "true" && channelCheck && channelCheck.length > 0) {
        // return res.json({ma:machine})

        for (let i = 0; i < channelCheck && channelCheck.length; i++) {
            const wastage_product_id = channelCheck[i].channel_product_id
            const wastage_product_quantity = channelCheck[i].channel_product_quantity
            const wastage_channel_id = channelCheck[i]._id
            const wastage_machine_id = channelCheck[i].machine_id
            const wastage_canteen_id = machine && machine.canteen_id

            const addWastage = await new wastageModel({
                wastage_product_id,
                wastage_product_quantity,
                wastage_channel_id,
                wastage_machine_id,
                wastage_canteen_id
            })
            await addWastage.save()
        }
    }
    // Delete Complete row with Channels
    await model.updateMany({ row_number: row_number, machine_id: mongoose.Types.ObjectId(machine_id) }, { $set: { channel_status: 'Deleted' } }, { multi: true })
    /// Update after this rows channel names and row_number
    await model.updateMany({ row_number: { $gt: row_number }, machine_id: mongoose.Types.ObjectId(machine_id) }, { $inc: { row_number: -1, channel_name: -10 } }, { multi: true })



    res.json({
        success: true,
        message: req.t('Channel Row is Deleted successfully'),

    })
})

exports.addMachineRow = asyncCatchHandler(async (req, res, next) => {

    const { machine_id } = req.params;
    const { row_position, row_number } = req.body
    let row_number_checked = false
    const data1 = await model.aggregate([{
        $match: {
            machine_id: mongoose.Types.ObjectId(machine_id),
            channel_status: 'Active'
        }
    }, {
        $group: {
            _id: '$row_number',
            Totdal: {
                $push: {
                    row_number: '$row_number'
                }
            }
        }
    }, { $project: { _id: 1 } }])


    if (data1 && data1.length >= 8) {
        return next(new ErrorHandler(req.t("you can't create new row.you can create max 8 rows"), 200))
    }

    if (row_position == "start") {
        const data1 = await model.aggregate([{
            $match: {
                machine_id: mongoose.Types.ObjectId(machine_id),
                channel_status: 'Active'
            }
        }, {
            $group: {
                _id: '$row_number',
                Totdal: {
                    $push: {
                        row_number: '$row_number'
                    }
                }
            }
        }, { $project: { _id: 1 } }])

        const update_rows = await model.updateMany({ machine_id: mongoose.Types.ObjectId(machine_id) }, { $inc: { row_number: 1 } });
        await model.updateMany({ machine_id: mongoose.Types.ObjectId(machine_id) }, { $inc: { channel_name: 10 } });
        for (let i = 1; i <= 7; i++) {
            const new_row = await new model(
                {
                    machine_id: mongoose.Types.ObjectId(machine_id),
                    row_number: 1,
                    channel_order: i,
                    channel_width: 1,
                    channel_name: 10 + i,
                    channel_product_id: null,
                    channel_product_quantity: 0,
                    channel_product_threshold: 0,
                    channel_extraction_time: null,
                    channel_status: "Active",

                })
            await new_row.save();
        }
        return res.json({
            success: true,
            message: req.t('New row is added successfully'),

        })

    }
    if (row_position == "end") {
        let big = 1
        const data1 = await model.aggregate([{
            $match: {
                machine_id: mongoose.Types.ObjectId(machine_id),
                channel_status: 'Active'
            }
        }, {
            $group: {
                _id: '$row_number',
                Totdal: {
                    $push: {
                        row_number: '$row_number'
                    }
                }
            }
        }, { $project: { _id: 1 } }])
        let last_channel = await model.findOne({ machine_id: mongoose.Types.ObjectId(machine_id), channel_status: 'Active' }).sort({ channel_name: -1 }).limit(1)
        //   return res.json(last_channel)
        data1.forEach(a => {
            if (big < a._id) {
                big = a._id
            }
        })

        //  const update_rows=await model.updateMany({machine_id:mongoose.Types.ObjectId(machine_id)},{$inc:{row_number:1}});
        // return res.json(last_channel.row_number)
        let rowIndex = (last_channel.row_number + 1) * 10
        // return res.json(rowIndex)
        for (let i = 0; i < 8; i++) {
            rowIndex = rowIndex + 1
            const new_row = new model({
                machine_id: mongoose.Types.ObjectId(machine_id),
                row_number: Number(big) + 1,
                channel_order: i,
                channel_width: 1,
                channel_name: rowIndex,
                channel_product_id: null,
                channel_product_quantity: 0,
                channel_product_threshold: 0,
                channel_extraction_time: "",
                channel_status: "Active",

            })
            await new_row.save();

        }
        return res.json({
            success: true,
            message: req.t('New row is added successfully'),

        })

    }
    data1.forEach(a => {
        if (row_number == Number(a._id)) {
            row_number_checked = true
        }
    })
    if (!row_number_checked) {
        return next(new ErrorHandler(req.t("row position not found"), 200))
    }
    let channel_final = await model.findOne({ machine_id: mongoose.Types.ObjectId(machine_id), row_number: row_number, channel_status: 'Active' }).sort({ channel_name: -1 })
    //   return res.json(channel_final.row_number)
    let index = (channel_final.row_number + 1) * 10
    let updateIndex = (channel_final.row_number + 1) * 10
    //   return res.json(index)
    await model.updateMany({ machine_id: mongoose.Types.ObjectId(machine_id), row_number: { $gt: row_number } }, { $inc: { channel_name: 10 } })
    await model.updateMany({ machine_id: mongoose.Types.ObjectId(machine_id), row_number: { $gt: Number(row_number) } }, { $inc: { row_number: 1 } });
    for (let i = 1; i <= 9; i++) {

        const new_row = await new model(
            {
                machine_id: mongoose.Types.ObjectId(machine_id),
                row_number: Number(channel_final.row_number) + 1,
                channel_order: i,
                channel_width: 1,
                channel_name: index + i,
                channel_product_id: null,
                channel_product_quantity: 0,
                channel_product_threshold: 0,
                channel_extraction_time: "",
                channel_status: "Active",

            })
        await new_row.save();
    }
    return res.json({
        success: true,
        message: req.t('New row is added successfully'),

    })
})

exports.emailOnThreshold = asyncCatchHandler(async (req, res) => {
    const channels = await model.find({ channel_status: 'Active', channel_product_id: { $ne: null }, channel_product_threshold: { $gt: 0 } });

    if (channels?.length > 0) {
        channels.forEach(async (channel) => {
            if (channel.channel_product_id != null) {
                if (channel.channel_product_quantity <= channel.channel_product_threshold) {

                    const canteen = await canteenModel.findOne({ _id: mongoose.Types.ObjectId(channel.canteen_id) });
                    const machineFiller = await user.findById(canteen?.machine_filler_id);
                    const machine = await machine_model.findById(channel.machine_id);
                    const product = await product_model.findById(channel.channel_product_id);

                    // try {
                    //     sgMail.send({
                    //         to: machineFiller?.user_email,
                    //         from: process.env.SENDER_EMAIL,
                    //         subject: 'Product Threshold Reached',
                    //         html: `
                    //         <div style="text-align:center;margin-top:5%">
                    //         canteen name: <b>${canteen.canteen_name}</b><br/><br/>
                    //         machine: <b>${machine?.machine_name}</b> <br/>
                    //         channel: <b>${channel?.channel_name} </b><br/>
                    //         product: <b>${product?.product_name}</b> <br/>
                    //         product quantity: <b>${channel?.channel_product_quantity}</b><br/>
                    //         </div>
                    //     `
    
                    //     }).then((response) => {
                    //         console.log('Email has been sent successfully')
                    //     })
                    //     .catch((error) => {
                    //         console.error(error)
                    //     });
                    // } catch(error) {
                    //     console.log(error);
                    // }
                }
            }
        });
    } else {
        res.status('200').json({
            success: true,
            message: 'No channels found'
        })
    }
    res.status('200').json({
        success: true,
        message: 'email has been sent'
    })
})

exports.machineProduct = async (req, res, next) => {
    try {
        const { canteen_id } = req.params;

        let channels = await model.find({ canteen_id: mongoose.Types.ObjectId(canteen_id), channel_product_id: { $ne: null }, channel_product_quantity: { $gte: 1 }, channel_status: { $ne: 'InActive' } }).select({ _id: 1, machine_id: 1, channel_product_quantity: 1, channel_extraction_time: 1, row_number: 1, channel_name: 1 }).populate({ path: 'machine_id', select: { _id: 1, machine_code: 1 } }).populate({ path: 'channel_product_id', select: { _id: 1, product_price: 1, product_name: 1, product_gradient: 1, product_VAT: 1, product_image: 1, product_description: 1 } })
        return res.json({
            success: true,
            channel: channels,

        })
    } catch (error) {
        return res.status(202).json({
            success: false,
            message: error.message
        })
    }
}


// cron.schedule('0 0 * * *', () => {
//     axios.post(`${process.env.BASE_URL}/api/v1/channel/email`)
// });


// cron.schedule('0 0 0 * * *', () => {
//     axios.post(`${process.env.BASE_URL}/api/v1/channel/email`)
// });


//The machine controller will update the channel status every few minutes whenever
//there is an update to give.
exports.updateChannelMachineStatus = asyncCatchHandler(async (req, res, next) => {
    const canteen_id = req.params.canteen_id; 
    const machine_number = req.params.machine_number;
    const tray_number = req.params.tray_number;
    const channel_number = req.params.channel_number;
    const status = req.params.status;        
    const percentageOfChannelsStatusUpdated = req.params.percentageOfChannelsStatusUpdated;

    if(canteen_id && machine_number && tray_number && channel_number && status) {

        const machineAggregate = [
            {
            '$match': {
                'canteen_id': new mongoose.Types.ObjectId(canteen_id),
                 'machine_code': parseInt(machine_number)
            }
            }, {
            '$project': {
                'machine_id': '$_id', 
                'canteen_id': '$canteen_id', 
                'machine_code': '$machine_code', 
                'machine_status': '$machine_status'
            }
            }
        ];
        
        const machine = await machine_model.aggregate(machineAggregate);
        if(machine?.length) {
            const machineId = machine[0].machine_id;
            const canteenId = machine[0].canteen_id;

            const channelsAggregate = [
                {
                  '$match': {
                    'machine_id': machineId,
                    'canteen_id': canteenId,
                    'channel_status': 'Active'
                  }
                }, {
                    '$addFields': {
                      'tray_number': {
                        '$sum': [
                          '$row_number', 10
                        ]
                      }
                    }
                  }
              ];

              //update the percentage of the channel status update
              await machine_model.updateOne({ _id: mongoose.Types.ObjectId(machineId) }, { $set: { percentageOfChannelsStatusUpdated } });
            // channel.updateMany({},{$set:{channel_machine_status:"Not Connected"}},{multi:true}).exec();                        

            const channels = await channel.aggregate(channelsAggregate);
            // console.log('channels',channels);
            if(channels?.length) {
                channels.forEach(channelO => {
                    if(channelO.mapped_tray_number === parseInt(tray_number) && channelO.mapped_channel_number === parseInt(channel_number)){
                        if(status === '0') {
                            channel.findOneAndUpdate({_id: channelO._id},{channel_machine_status:"Not Connected"}).exec();
                        } else if (status === '1') {
                            channel.findOneAndUpdate({_id: channelO._id},{channel_machine_status:"In service with product"}).exec();
                        } else if (status === '2') {
                            channel.findOneAndUpdate({_id: channelO._id},{channel_machine_status:"In service but sold out"}).exec();
                        } else if (status === '3') {
                            channel.findOneAndUpdate({_id: channelO._id},{channel_machine_status:"Channel Faulty"}).exec();                        
                        }
                    }});
                
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

//this request will call the machine controller and will provide the list of rows and channels to the machine
exports.requestChannelStatusFromMachine = asyncCatchHandler(async (req, res) => {
    const machine_id = req.params.machine_id;
    const canteen_id = req.params.canteen_id;
    if (machine_id && canteen_id) {
        const machineAggregate = [
            {
              '$match': {
                'machine_id': new mongoose.Types.ObjectId(machine_id),
                'channel_status': 'Active'
              }
            }, {
              '$lookup': {
                'from': 'machines', 
                'localField': 'machine_id', 
                'foreignField': '_id', 
                'as': 'machine'
              }
            }, {
              '$unwind': {
                'path': '$machine', 
                'includeArrayIndex': 'string', 
                'preserveNullAndEmptyArrays': true
              }
            }, {
              '$project': {
                'machine_id': '$machine_id', 
                'row_number': '$row_number', 
                'channel_order': '$channel_order', 
                'machine_number': '$machine.machine_code',
                'mapped_tray_number': '$mapped_tray_number',
                'mapped_channel_number': '$mapped_channel_number'
              }
            }, {
              '$addFields': {
                'tray_number': {
                  '$sum': [
                    '$row_number', 10
                  ]
                }
              }
            }, {
                '$project': {
                  'tray_number': '$tray_number', 
                  'channel_number': '$channel_order', 
                  'machine_number': '$machine_number',
                  'mapped_tray_number': '$mapped_tray_number',
                  'mapped_channel_number': '$mapped_channel_number'
                }
              },
          ];
         
        const channels = await channel.aggregate(machineAggregate);
        if(channels?.length) {

            const channelsToGetRequestFor =[];
            channels.forEach(channelO => {
                if(!channelsToGetRequestFor.find(ctgr => ctgr.mapped_tray_number === channelO.mapped_tray_number && ctgr.mapped_channel_number === channelO.mapped_channel_number)) {
                    channelsToGetRequestFor.push(channelO);
                }
            });

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
            // console.log('canteen_endpoint', canteen_endpoint);
            if (canteen_endpoint?.length) {
                
                await axios.post(`${canteen_endpoint[0].canteen_endpoint}/status-of-channels-request-from-cloud`, {
                    data: channelsToGetRequestFor
                });
            }          
            
            res.status('200').json({
                success: true                
            });

        } else {
            res.status('200').json({
                success: false        
            });
        }
        
    } else {
        res.status('200').json({
            success: false,
            message: 'Please provide machine id and canteen id'
        });
    }
});

exports.removeProductFromChannel = asyncCatchHandler(async (req, res) => {
    const channelId = req.params.channel_id;   
    await channel.updateOne({_id: new mongoose.Types.ObjectId(channelId)}, {channel_product_id: null, channel_product_quantity: 0, channel_product_limit: 0}).exec();
    res.status('200').json({
        success: true,
        message: 'Product removed from the channel'
    });

});

