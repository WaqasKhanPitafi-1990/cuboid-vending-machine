const ErrorHandler = require('../utils/errorHandling');


module.exports = (err, req, res, next) => {

    err.statuscode = err.statusCode || 404;
    err.message = err.message || 'Internal server error';

// err.message.map(data=>console.log(data))
    res.status(err.statuscode).json({
        success: false,
        // Status:err.statuscode,
        // error: err.stack,
        message:err.message
        // message:err.message
    });
};