const mongoose = require("mongoose");

const subsidy = mongoose.Schema({
    canteen_id: [{
        type: mongoose.Types.ObjectId,
        ref: "canteen",
    }],
   
    subsidy: {
        type: Number,
        required: [true, 'subsidy must be reqired']
    },
   
    status: {
        type: String,
        required: [true, 'status must be required']
    },
    company_id: {
        type: mongoose.Types.ObjectId,
        ref:'user',
        required: [true, 'company id must be required']

    },
    subsidy_parent_id:{
        type:mongoose.Types.ObjectId,
        ref:'user'
    },
    subsidy_type:{
        type:String
    },
    start_date:{
        type:Date
    },
    end_date:{
        type:Date
    },
    renew_period:{
        type:Number,
        default:1
    }
},
{ timestamps: true });

module.exports = mongoose.model('subsidy', subsidy);

