
const mongoose = require('mongoose');
const model = require('../model/logs');

exports.logs = (async (canteen_id, machine_id, product_id, banner_id, category_id, user_id, wastage_id, channel_id, discount, machine_event, temperature, page, promotion, subsidy, event, message, req, res, next) =>{
    try {
        const data = new model({
            canteen_id,
            machine_id,
            product_id,
            banner_id,
            category_id,
            user_id,
            wastage_id,
            channel_id,
            event,
            message,
            discount_id:discount,
            // machine_event,
            temperature_id:temperature,
            page_id:page,
            promotion_id:promotion,
            subsidy_id:subsidy,
            filler_id: req?.user?._id
        });

        await data.save();
        
    }
    catch (error) {
        console.log("errrr");
       console.log(error.message);
    }

});

