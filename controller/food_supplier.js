const mongoose = require("mongoose");

const canteenModel = require("../model/canteen");
const machineModel = require("../model/verdering");
const channelModel = require("../model/channel");
const ErrorHandler = require("../utils/errorHandling");
const asyncCatchHandler = require("../middleware/catchAsyncError");
const channel = require("../model/channel");

const userModel = require("../model/userModel");



//// Assign or update Canteen to supplier

exports.assignCanteen = asyncCatchHandler(async (req, res, next) => {

    const { canteen_id, food_supplier_id } = req.params;

    const user = await userModel.findOne({ _id: mongoose.Types.ObjectId(food_supplier_id), user_role: 'food_supplier', user_status: 'Active' })
   
    if (!user) {
        return next(new ErrorHandler("Supplier not found", 422));
    }
   
    const assignCanteen = await canteenModel.findById({ _id: mongoose.Types.ObjectId(canteen_id), canteen_status: 'Active' })

    if (!assignCanteen) {
        return next(new ErrorHandler("Canteen not found", 422));
    }

    user ? assignCanteen.food_supplier_id = food_supplier_id : assignCanteen.food_supplier_id

    await assignCanteen.save()

    res.json({
        success: true,
        message: 'canteen is assigned successfully'
    })
})


///// Display All Canteen under 1 Supplier
exports.supplierCanteen = asyncCatchHandler(async (req, res, next) => {

    const { food_supplier_id } = req.params;

    const user = await userModel.findById({ _id: mongoose.Types.ObjectId(food_supplier_id),user_status:'Active' })

    if (!user) {
        return next(new ErrorHandler("User not found", 422));
    }
    const assignCanteen = await canteenModel.find({ food_supplier_id: mongoose.Types.ObjectId(food_supplier_id) })
        .populate({ path: 'food_supplier_id', select: { '_id': 1, 'name': 1, 'email': 1, 'phone': 1, 'role': 1, 'profile': 1 } });
    if (assignCanteen.length < 1) {
        return next(new ErrorHandler("Food Supplier has no canteen", 422));
    }

    res.json({
        success: true,
        assignCanteen
    })
})


///// Display All Machines under 1 Canteen

exports.machineCanteen = asyncCatchHandler(async (req, res, next) => {
    const { canteen_id } = req.params

    const canteen_Link_Machine = await machineModel.find({ canteen_id: mongoose.Types.ObjectId(canteen_id) });

    if (canteen_Link_Machine.length < 1) {
        return next(new ErrorHandler("Canteen has no  machine", 422));
    }

    res.json({
        success: true,
        All_Machines: canteen_Link_Machine,
    });
});

