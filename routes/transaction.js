const express = require('express');

const router = express.Router();
const userAuth = require('../middleware/userAuth')

const {createTransaction, getAllTransactions, getTransaction, deleteTransaction} = require('../controller/transaction');



router.post('/', userAuth, createTransaction);
router.get('/', getAllTransactions);
router.get('/:id', getTransaction);
router.delete('/:id', deleteTransaction)

module.exports = router;