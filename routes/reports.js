const express = require('express');
const Auth = require('../middleware/auth');
const userAuth = require('../middleware/userAuth');
const router = express();
const { 
    saleReports,
    salesReportsByMachine,
    inventoryReport,
    getTransactionsLogReport,
    getCanteenLocations,
    getCanteens, 
    getDowntimes, 
    getMachine,
    topTenEvents,
    topMachines,
    topProducts,
    totalSaleRevenue,
    monthlyReports,
    monthlyMachineReports,
    salesDashboard,
    productSales,
    getAllProductCategories,
    wastageReport,
    salesReportv2
} = require('../controller/reports');

const { getAllCompany } = require('../controller/company');

router.get('/sales-reports-Machine', userAuth,Auth("sale_report_by_machine"),salesReportsByMachine); 
router.get('/inventory-reports', userAuth,Auth("inventory_report"),  inventoryReport);
router.get('/sales-reports', userAuth,Auth("sale_report"),  saleReports);
router.get('/monthly-machine-report', userAuth,Auth("monthly_machine_report"),monthlyMachineReports);  
router.get('/monthly-report', userAuth,Auth("monthly_reports"),monthlyReports);  
router.get('/list-machines', userAuth,  getMachine);
router.get('/product-sales',userAuth,Auth("product_sale"),productSales);

router.get('/list-canteen-locations', userAuth, getCanteenLocations);
router.get('/list-canteen-names', userAuth, getCanteens);
router.get('/transaction-log', userAuth,Auth("transaction_log_report"),getTransactionsLogReport);
router.get('/downtimes',userAuth,Auth("downtime_view"),getDowntimes);
router.get('/top-ten-events', userAuth,Auth("top_ten_events"),topTenEvents);
router.get('/top-machines', userAuth,Auth("top_machine"),topMachines);
// router.get('/top-products', userAuth,Auth("top_products"), topProducts);
router.get('/total-sale-revenue', userAuth,Auth("total_sale_revenue"),totalSaleRevenue);
router.get('/sales-dashboard', userAuth,Auth("sales_dashboard"), salesDashboard);
router.get('/list-companies', userAuth, getAllCompany);
router.get('/list-product-categories',userAuth, getAllProductCategories);
router.get('/wastage-reports', userAuth,  wastageReport);
router.get('/sales-report-v2', userAuth, salesReportv2);

module.exports = router;


