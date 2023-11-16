
const app = require('./server');
const errorMiddleware = require('./middleware/error');
require('dotenv').config();

const PORT = process.env.PORT;
console.log('PORT', PORT);

process.env.TZ = process.env.TIME_ZONE;
console.log('time now', new Date().toLocaleString());

app.use(errorMiddleware);
app.listen(PORT, () => { console.log(`Server is working on ${PORT} PORT`); });


// const permissions=[
//     {
//         Product:['product_create','product_view','product_edit','product_delete'],
//         Machine:['machine_create','machine_view','machine_edit','machine_delete'  ],
//     Channel:['channel_create','channel_view','channel_edit','channel_delete',
//     'channel_merge','channel_unmerge','row_add','row_delete'],
//         Canteen:['canteen_create','canteen_view','canteen_edit','canteen_delete'],
//         Discount:['discount_create','discount_view','discount_edit','discount_delete'],
//         Promotion:['promotion_create','promotion_view','promotion_edit','promotion_delete'],
//         User:['user_create','user_view','user_edit','user_delete','white_list_user'],
//         Category:['category_create','category_view','category_edit','category_delete'],
//         Banner:['banner_create','banner_view','banner_edit','banner_delete'],
// //         Page_Builder:['page_create','page_view','page_edit','page_delete'],
//         Waste_Management:['wastage_create','wastage_view','wastage_edit','wastage_delete'],
//         Inventory:['inventory_view','product_add','product_remove'],
// //         Permission:['permission_add','permission_view','permission_delete','permission_update']
// }]