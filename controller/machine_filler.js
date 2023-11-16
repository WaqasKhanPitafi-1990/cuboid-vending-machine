const mongoose = require('mongoose');


const userModel = require('../model/userModel');
const canteenModel = require('../model/canteen')
const channelModel = require('../model/channel')
const machineModel = require('../model/verdering')
const wastageModel = require('../model/wastage');
const { OrderModel } = require('../model/order');
const axios = require('axios')
const freeVendModel = require('../model/freeVend')
const bcrypt = require("bcryptjs");
const { logs } = require('../utils/logs')

// Category Machine wise 

exports.machineCategory = async (req, res, next) => {
    try {
        const { machine_id } = req.params

        const productCategory = await channelModel.aggregate([{
            $match: {
                machine_id: mongoose.Types.ObjectId(machine_id),
                channel_product_id: {
                    $ne: null
                },
                channel_product_quantity: {
                    $gte: 1
                }
            }
        }, {
            $lookup: {
                from: 'products',
                localField: 'channel_product_id',
                foreignField: '_id',
                as: 'string'
            }
        }, {
            $unwind: {
                path: '$string',
                preserveNullAndEmptyArrays: true
            }
        }, {
            $lookup: {
                from: 'catagories',
                localField: 'string.product_catagory_id',
                foreignField: '_id',
                as: 'Catagory'
            }
        }, {
            $group: {
                _id: {
                    _id: '$Catagory._id',
                    catagory: '$Catagory'
                },
                channel: {
                    $push: {
                        _id: '$_id'
                    }
                }
            }
        }, {
            $project: {
                _id: 0,
                category: '$_id.catagory'
            }
        }, {
            $unwind: {
                path: '$category',
                preserveNullAndEmptyArrays: true
            }
        }, {
            $project: {
                catagories_name: '$category.catagories_name',
                catagories_status: '$category.catagories_status',
                _id: '$category._id',
                catagories_image: '$category.catagories_image'
            }
        }])

        if (productCategory.length < 1) {
            return res.json({
                success: false,
                message: 'No category found'
            })
        }
        return res.json({
            success: true,
            productCategory,
        });

    } catch (error) {
        return res.status(202).json({
            success: false,
            message: error.message
        })
    }

}

// Product against category in channels


exports.categoryProduct = async (req, res, next) => {
    try {
        const { machine_id } = req.params
        const { category_id } = req.query
        let channels
        if (category_id) {
            channels = await channelModel.aggregate([{
                $match: {
                    machine_id: mongoose.Types.ObjectId(machine_id),
                    channel_product_id: {
                        $ne: null
                    }
                }
            }, {
                $lookup: {
                    from: 'products',
                    localField: 'channel_product_id',
                    foreignField: '_id',
                    as: 'product'
                }
            }, {
                $unwind: {
                    path: '$product',
                    preserveNullAndEmptyArrays: true
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
                    from: 'catagories',
                    localField: 'product.product_catagory_id',
                    foreignField: '_id',
                    as: 'category'
                }
            }, {
                $unwind: {
                    path: '$category',
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $group: {
                    _id: {
                        category_id: '$category._id',
                        category: '$category',
                        machine: '$machine'
                    },
                    channels: {
                        $push: {
                            _id: '$_id',
                            machine_id: '$machine_id',
                            row_number: '$row_number',
                            channel_width: '$channel_width',
                            channel_name: '$channel_name',
                            channel_product_quantity: '$channel_product_quantity',
                            channel_order: '$channel_order',
                            channel_status: '$channel_status',
                            channel_product_threshold: '$channel_product_threshold',
                            channel_extraction_time: '$channel_extraction_time',
                            product: '$product',
                            mapped_tray_number: '$mapped_tray_number',
                            mapped_channel_number:'$mapped_channel_number'
                        }
                    }
                }
            }, {
                $project: {
                    _id: 0,
                    category_id: '$_id.category._id',
                    category_name: '$_id.category.catagories_name',
                    catagories_image: '$_id.category.catagories_image',
                    machine_name: '$_id.machine.machine_name',
                    machine_id: '$_id.machine._id',
                    machine_code: '$_id.machine.machine_code',
                    channels: 1
                }
            }]);

            return res.json({
                success: true,
                data: channels
            })
        } else {
            channels = await channelModel.aggregate([{
                $match: {
                    machine_id: mongoose.Types.ObjectId(machine_id),
                    channel_product_id: {
                        $ne: null
                    }
                }
            }, {
                $lookup: {
                    from: 'products',
                    localField: 'channel_product_id',
                    foreignField: '_id',
                    as: 'product'
                }
            }, {
                $unwind: {
                    path: '$product',
                    preserveNullAndEmptyArrays: true
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
                    from: 'catagories',
                    localField: 'product.product_catagory_id',
                    foreignField: '_id',
                    as: 'category'
                }
            }, {
                $unwind: {
                    path: '$category',
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $group: {
                    _id: {
                        category_id: '$category._id',
                        category: '$category',
                        machine: '$machine'
                    },
                    channels: {
                        $push: {
                            _id: '$_id',
                            machine_id: '$machine_id',
                            row_number: '$row_number',
                            channel_width: '$channel_width',
                            channel_name: '$channel_name',
                            channel_product_quantity: '$channel_product_quantity',
                            channel_order: '$channel_order',
                            channel_status: '$channel_status',
                            channel_product_threshold: '$channel_product_threshold',
                            channel_extraction_time: '$channel_extraction_time',
                            product: '$product',
                            mapped_tray_number: '$mapped_tray_number',
                            mapped_channel_number:'$mapped_channel_number'
                        }
                    }
                }
            }, {
                $project: {
                    _id: 0,
                    category_id: '$_id.category._id',
                    category_name: '$_id.category.catagories_name',
                    catagories_image: '$_id.category.catagories_image',
                    machine_name: '$_id.machine.machine_name',
                    machine_id: '$_id.machine._id',
                    channels: 1,
                    machine_code: '$_id.machine.machine_code',
                }
            }])

        }
        return res.json({
            success: true,
            data: channels,
        });

    } catch (error) {
        console.log('error',error);
        return res.status(202).json({
            success: false,
            message: error.message
        })
    }
}





/// Display All Canteens under One Machine Filler 

exports.displayMachineFillerCanteens = async (req, res, next) => {
    try {
        const { machine_filler_id } = req.params

        const user = await userModel.findOne({ _id: mongoose.Types.ObjectId(machine_filler_id), user_status: 'Active' })
        if (!user) {
            return res.status(200).json({
                success: false,
                message: 'user not found'
            })
        }
        const machineFillerCanteens = await canteenModel.find({ machine_filler_id: mongoose.Types.ObjectId(machine_filler_id), canteen_status: 'Active' }).populate({ path: 'machine_filler_id', select: { user_name: 1, user_role: 1 } })



        return res.json({
            success: true,
            data: machineFillerCanteens
        })
    }
    catch (error) {
        return res.status(202).json({
            success: false,
            message: error.message
        })
    }
}

//// Display Machine under 1 Canteens


exports.displayMachines = async (req, res, next) => {

    try {
        const { canteen_id } = req.params

        const machine_filler_id = req.user && req.user._id
        const user = await userModel.findOne({ _id: mongoose.Types.ObjectId(machine_filler_id), user_status: 'Active' })
        if (!user) {
            return res.status(200).json({
                success: false,
                message: 'user not found'
            })
        }
        const machineFillerMachines = await canteenModel.findOne({ _id: mongoose.Types.ObjectId(canteen_id), machine_filler_id: mongoose.Types.ObjectId(machine_filler_id), canteen_status: 'Active' })

        if (machineFillerMachines && machineFillerMachines.length < 1) {
            return res.json({
                success: false,
                message: "Machine Filler have not assign this Canteen"
            });
        }

        const machine = await machineModel.find({ canteen_id: mongoose.Types.ObjectId(canteen_id), machine_status: 'Active' })

        if (machine && machine.length < 1) {
            return res.status(200).json({
                success: false,
                message: "No machine Associate with this canteen"
            });
        }
        return res.json({
            success: true,
            data: machine
        })
    }

    catch (error) {
        return res.status(202).json({
            success: false,
            message: error.message
        })
    }
}

/// Display Machine Channel

exports.displayMachineChannel = async (req, res, next) => {
    try {
        const { machine_id } = req.params;


        const machineModel = await channelModel.aggregate([{
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
                row_number: 1,
                channel_order: 1
            }
        }])
        if (machineModel && machineModel.length < 1) {
            return res.json({
                success: false,
                message: 'Machine channel not found'
            })
        }
        res.json({
            success: true,
            channel: machineModel
        })
    }
    catch (error) {
        return res.status(202).json({
            success: false,
            message: error.message
        })
    }
}



/// Update inventory in Machine Channel
exports.inventoryUpdateByMachineFiller = async (req, res, next) => {
    try {

        const { machine_id } = req.params
        const { channel } = req.body
        const allChannel = await channelModel.find({ machine_id: mongoose.Types.ObjectId(machine_id) });
        let arrayData = []
        let check = false
        // Check quantity type is number
        channel && channel.map(data => {
            if (data.channel_product_quantity == undefined || typeof data.channel_product_quantity == "string") {
                check = true
            }
        })
        if (check) {
            return res.json({
                success: false,
                message: "Quantity must be required"
            });
        }
        // Check Product is assign to channel or not
        channel && channel.map(data1 => {

            allChannel ? allChannel.map(data => {
                //    console.log(data._id,data1._id)
                if (data._id == data1._id) {

                    if (data.channel_product_id == null) {

                        arrayData.push(data)
                    }
                }
            }) : ""
        })

        if (arrayData && arrayData.length >= 1) {
            return res.json({
                success: false,
                message: "These Channel don't have assign product, Please assign product to update inventory",
                data: arrayData
            })
        }


        /// Update Inventory
        channel ? channel.map(async data => {
            const channelUpdate = await channelModel.findOne({ machine_id: mongoose.Types.ObjectId(machine_id), _id: mongoose.Types.ObjectId(data._id) })
            channelUpdate ? channelUpdate.channel_product_quantity = data.channel_product_quantity : data.channel_product_quantity
            channelUpdate ? await channelUpdate.save() : ""


        }) : ""

        return res.json({
            success: true,
            message: "Inventory is updated successfully"
        })
    }
    catch (error) {
        return res.status(202).json({
            success: false,
            message: error.message
        })
    }
}

///  Add Wastage
exports.wasteInventory = async (req, res, next) => {
    try {
        const { channel } = req.body;
        const { machine_id } = req.params;
        const filler = req?.user?._id

        const checkCanteen = await machineModel.findOne({
            _id: mongoose.Types.ObjectId(machine_id),
        });
        if (!checkCanteen) {
            return res.json({
                success: false,
                message: "Machine not found",
            });
        }
        let check = false;
        channel &&
            channel.map((data) => {
                if (
                    !data.channel_product_quantity ||
                    typeof data.channel_product_quantity == "string"
                ) {
                    check = true;
                }
            });
        if (check) {
            return res.status(422).json({
                success: false,
                message: "Quantity must be required",
            });
        }
        let canteen_id = checkCanteen.canteen_id;

        let getChannel = [];
        let lessQuantity = [];
        const channelData = await channelModel.find({
            machine_id: mongoose.Types.ObjectId(machine_id),
        });
        channel
            ? channel.forEach((data1) => {
                channelData.forEach(async (data) => {
                    if (data1._id == data._id) {
                        if (
                            data1.channel_product_quantity > data.channel_product_quantity
                        ) {
                            lessQuantity.push(data);
                        } else {
                            getChannel.push(data1);
                        }
                    }
                });
            })
            : "";

        // console.log(getChannel);
        getChannel
            ? getChannel.map(async (data) => {
                const channelUpdate = await channelModel.findOne({
                    machine_id: mongoose.Types.ObjectId(machine_id),
                    _id: mongoose.Types.ObjectId(data._id),
                });
                channelUpdate
                    ? (channelUpdate.channel_product_quantity =
                        channelUpdate.channel_product_quantity -
                        data.channel_product_quantity)
                    : data.channel_product_quantity;
                channelUpdate ? await channelUpdate.save() : "";
            })
            : "";

        // canteen_id,
        getChannel
            ? getChannel.forEach(async (data2) => {
                const wastageData = new wastageModel({
                    wastage_canteen_id: canteen_id,
                    wastage_machine_id: machine_id,
                    wastage_product_id: data2.channel_product_id,
                    wastage_product_quantity: data2.channel_product_quantity,
                    wastage_channel_id: data2._id,
                    filler
                });

                const store = await wastageData.save();
                await logs(null, null, null, null, null, null, store._id, null, null, null, null, null, null, null, "Add wastage", ` wastage has been added from ${req?.user?.user_name}`, req, res, next)
            })
            : "";

        if (lessQuantity && lessQuantity.length >= 1) {
            return res.json({
                success: false,
                message:
                    "Wasted is added successfully but some products have less quantity in channels",
                data: lessQuantity,
            });
        } else {
            return res.json({
                success: true,
                message: "Waste is added successfully",
            });
        }
    } catch (error) {
        return res.json({
            success: false,
            message: error.message,
        });
    }
};

// Channel setting 

exports.channelSetting = async (req, res, next) => {
    try {
        const { channel_id } = req.params
        const { channel_product_id, channel_extraction_time } = req.body;

        const channelUpdate = await channelModel.findOne({ _id: mongoose.Types.ObjectId(channel_id), machine_status: 'Active' })

        if (!channelUpdate) {
            return res.json({
                success: false,
                message: 'machine not found'
            })
        }

        channelUpdate ? channelUpdate.channel_extraction_time = channel_extraction_time : ""
        channelUpdate ? channelUpdate.channel_product_id = channel_product_id : ""
        await channelUpdate.save()
        return res.json({
            success: true,
            message: 'Channel is updated successfully'
        })
    }
    catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}


/// free vend


exports.freeVend = async (req, res, next) => {
    try {
        const { canteen_id } = req.params;
        const { status, machine_id, product_id, product_price, product_quantity, trayNumber, channelNumber, channel_id, machineNumber, dispensingSpeed, mapped_tray_number, mapped_channel_number, channel_extraction_time } = req.body;
        console.log('freevend req.body', req.body);
        const canteen = await canteenModel.findOne({ _id: mongoose.Types.ObjectId(canteen_id), canteen_status: 'Active' });
        if (!canteen) {
            return res.json({
                success: false,
                message: 'Canteen not found'
            })
        }

        const channel = await channelModel.findById(channel_id);

        if (!channel) {
            return res.json({
                success: false,
                message: 'Channel not found'
            })
        }
        if (product_quantity > channel.channel_product_quantity) {
            return res.json({
                success: false,
                message: 'Product has less quantity in this channel'
            })
        }
        // channel.channel_product_quantity=channel.channel_product_quantity-product_quantity
        // await channel.save();

        let products = [{
            product_id: product_id,
            product_price: product_price,
            product_quantity: product_quantity,
            machineNumber: machineNumber,
            mappedTrayNumber: mapped_tray_number,
            mappedChannelNumber: mapped_channel_number,
            dispensingSpeed: dispensingSpeed,
            extractionTime: channel_extraction_time

        }];

        console.log('products', products);

        const deliverOrder = axios.post(`${canteen.end_point}/deliver-order`, {
            orderId: "12345",
            freeVend: true,
            products: products,
        }).then(data => console.log(data)).catch(err => { console.log(err.message) })
        const freeVend = await new freeVendModel({
            machine_id,
            product_id,
            product_price,
            product_quantity,
            total_price: Number(product_price) * Number(product_quantity),
            channel_id,
            status,
            filler_id: req?.user?._id

        })
        await freeVend.save()
        return res.json({
            success: true,
            message: "product is vending successfully"
        })
    }
    catch (err) {
        return res.json({
            success: false,
            message: err.message
        })
    }
}

// test localization

exports.testLanguage = async (req, res, next) => {
    try {
        return res.json({
            message1: req.t('message1'),
            message2: req.t('message2'),
            message3: req.t('message3'),
            message4: req.t('message4')
        })
    }
    catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

/// update User Date
exports.updateUserData = async (req, res, next) => {
    try {

        const user_id = req?.user?._id
        let { user_name, user_phone, user_password } = req.body
        let message = "User is updated successfully"

        let updateUser = await userModel.findOne({ _id: mongoose.Types.ObjectId(user_id) })
        if (!updateUser) {
            return res.json({
                success: false,
                message: req.t('user not found')
            })
        }
        if (user_password && !user_name && !user_phone) {
            if (user_password && user_password.length < 6) {
                return res.json({
                    success: false,
                    message: 'Password must have ateast 6 character'
                })
            }
            user_password = await bcrypt.hash(user_password, 10);
            message = "password has been changed successfully"

        }
        user_name ? updateUser.user_name = user_name : user_name
        user_phone ? updateUser.user_phone = user_phone : user_phone
        user_password ? updateUser.user_password = user_password : user_password

        updateUser && updateUser.save()

        return res.json({
            success: true,
            message: message,

        })
    }
    catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}