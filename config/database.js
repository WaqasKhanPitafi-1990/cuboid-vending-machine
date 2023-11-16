const res = require('express/lib/response');
const mongoose = require('mongoose');
require('dotenv').config()

const URL = process.env.MONGODB_DATABASE

const databaseConnection = async () => {

    try {
        await mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true })

        console.log('Database connected successfully')
    }

    catch (error) {
        return res.json({
            success:false,
            error:error,
            message:'Database connection error'
        })
        
    }
}

module.exports = databaseConnection