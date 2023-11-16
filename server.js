// const app = require('./server');
const express = require('express');
const databaseConnection = require('./config/database');
const app = express();
const passport = require('passport');
var session = require('express-session');
const cookieParser = require('cookie-parser');
var flash = require('connect-flash');
const cors = require('cors');
const machine = require('./routes/machine');
const discount = require('./routes/discount');
const order = require('./routes/order');
var path = require('path');
const Redis=require('redis');
const client =Redis.createClient();

client.connect();

app.use(express.json({limit: '200mb'}));
app.use(express.urlencoded({limit: '200mb'}));

// const errorMiddleware = require('./middleware/error');
const corsOptions = {
    origin: '*',
    'Access-Control-Allow-Origin': '*',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200,
};

require('dotenv').config();
databaseConnection();
app.use(cors(corsOptions)); // Use this after the variable declaration

// Language localization
const i18next=require('i18next');
const Backend=require('i18next-fs-backend');
const middleware=require('i18next-http-middleware');

i18next.use(Backend).use(middleware.LanguageDetector)
.init({
    fallbackLng:'en',
    backend:{
        loadPath:'./locales/{{lng}}/translation.json'
    }
});
app.use(middleware.handle(i18next));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 60000 }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
// app.use(errorMiddleware);
app.use('/api/v1/translator', require('./routes/translator'));
app.use('/api/v1/registration', require('./routes/registration'));
app.use('/api/v1/banner', require('./routes/banner'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/catagories', require('./routes/catagories'));
app.use('/api/v1/product', require('./routes/product'));
app.use('/api/v1/inventory', require('./routes/inventory'));
app.use('/api/v1/cart', require('./routes/cart'));
app.use('/api/v1/canteen', require('./routes/canteen'));
app.use('/api/v1/promotion', require('./routes/promotion'));
app.use('/api/v1/page', require('./routes/page'));
app.use('/api/v1/machine', machine);
app.use('/api/v1/discount', discount);
app.use('/api/v1/order', order);
app.use('/api/v1/transaction', require('./routes/transaction'));
app.use('/api/v1/white_list', require('./routes/whiteList'));


app.use('/api/v1/channel', require('./routes/channel'));

app.use('/api/v1/permissions', require('./routes/permissions'));
// app.use('/api/v1/roles', require('./routes/roles'))
app.use('/api/v1/machine_filler', require('./routes/machine_filler'));
app.use('/api/v1/food_supplier', require('./routes/food_supplier'));
app.use('/api/v1/wastage', require('./routes/wastage'));
app.use('/api/v1/role_permissions', require('./routes/role_permission'));
app.use('/api/v1/event', require('./routes/event'));
app.use('/api/v1/subsidy', require('./routes/subsidise'));
app.use('/api/v1/notifications', require('./routes/notifications'));
app.use('/api/v1/vend', require('./routes/vendProductLimits'));
app.use('/api/v1/company', require('./routes/company'));
app.use('/api/v1/machine_temperature', require('./routes/machineTemperatureLogs'));
app.use('/api/v1/user_points', require('./routes/points'));
app.use('/api/v1/company_subsidy', require('./routes/companySubsidy'));
app.use('/api/v1/reports',require('./routes/reports'));
app.use('/api/v1/free_vend',require('./routes/freeVend'));
app.use('/api/v1/logs',require('./routes/logs'));
app.use('/api/v1/priority',require('./routes/machinePriorityLogs'));
// const PORT = 3000;
// console.log('pr', process.env.PORT);

module.exports = app;

