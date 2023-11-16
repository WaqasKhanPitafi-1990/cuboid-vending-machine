const mongoose = require('mongoose');

const schema = mongoose.Schema({
    machine_name: {
        type: String,
        required: true,
    },
    canteen_id: {
        type: mongoose.Types.ObjectId,
        ref: 'canteen',
        required: true,
    },
    machine_code: {
        type: Number,
        required: true,
    },
    machine_status: {
        type: String,
        default: 'Active',
    },
    machine_parent_id:{
type:mongoose.Types.ObjectId,
ref:'user'
    },
    payment_method: {
        type:Array,
        default:['VIPPS','Paypal']
    },
    machine_location: {
        type: String,
     
    },
    machine_temperature:{
    type:String,
    default:'+00.0'
    },
    machine_channel_column: {
        type: Number,
        default: 7
    },
    machine_channel_rows: {
        type: Number,
        default: 5
    },
    door_status: {
        type: String,
        default: 'Door closed' //Door closed, Door opened (machine does not dispense)
    },
    light_status: {
        type: String,
        default: 'Light Off' //Light Off, Light On
    },
    machine_communication_status: {
        type: String,
        default: 'Machine connected'
    },
    machine_service_status: {
        type: String,
        default: 'Machine in service'
    },
    machine_dispense_status: {
        type: String,
        default: 'Machine free: available for performing dispenses.'
    },
    programming_time_wating_for_product_collection: {
        type: Number,
        default: 1
    },
    percentageOfChannelsStatusUpdated: {
        type: Number,
        default: 0
    },
    requested_machine_temperature:{
        type:String,
        default:'+00.0'
    },
}, { timestamps: true });

module.exports = mongoose.model('machine', schema);
