const axios=require('axios');

const asyncCatchHandler = require('../middleware/catchAsyncError')

exports.adminNotifications = asyncCatchHandler(async (req, res, next) => {
    const notification = {
        title: req.body.title,
        text: req.body.text,
    }    

    

    if(!req.body.tokens) {
        res.status(400).json({
            message: 'Please add device token',
        });
    }

    // tokens should be an array
    const fcm_tokens = req.body.tokens;

    const notification_body = {
        notification: notification,
        registration_ids: fcm_tokens,
    }


    axios.post('https://fcm.googleapis.com/fcm/send', JSON.stringify(notification_body), {
        headers: {
            'Authorization': `key=${process.env.FCM_SERVER_KEY}`,
            'Content-Type': 'application/json',
    }})
    .then(response => {
        res.status(200).json({
            status: 'success',
            data: response.data
        })
    })
    .catch(err => {
        res.status(400).json({
            status: 'error',
            message: err.message
        })
    })
})