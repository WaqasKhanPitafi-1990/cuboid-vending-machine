

const express = require('express');
const { getOrder, refundPayment,refundPaymentOrders} = require('../controller/order');
const userAuth = require('../middleware/userAuth')
const router = express.Router();
const Auth = require('../middleware/auth');


// router.post('', userAuth, addOrder);

router.get('/', userAuth,Auth("order_view"), getOrder);
router.get('/refundOrders', userAuth, refundPaymentOrders);
router.post('/refund',Auth("order_refund_payment"), refundPayment);

// router.get('/user/:id', userAuth, userOrders);

// router.delete('/:id', userAuth, deleteOrder);

module.exports = router;