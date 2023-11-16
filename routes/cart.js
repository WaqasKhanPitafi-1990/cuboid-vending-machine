const express = require('express');

const router = express.Router();

const { addCart, updateCart, displayCart, deleteCart, deleteItem } = require('../controller/cart')

const {createCart,addProduct,increaseProduct,decreaseProduct,displayCartProduct}=require('../controller/cart')
const userAuth = require('../middleware/userAuth');



// Create empty cart
router.post('/', userAuth, createCart);
// Add Product into CART
router.post('/add_product', userAuth, addProduct);
// add product quantity
router.patch('/add', userAuth, increaseProduct);
// remove product quantity
router.patch('/remove', userAuth, decreaseProduct);
/// Display all Products in CART
router.get('/user_id/:user_id', userAuth, displayCartProduct);






//////////////////////

//// Add Update Cart 

// router.post('/post', userAuth, updateCart);

//// Add Update Cart 


///// Create Empty CART
// router.post('/', userAuth, addCart);




/// Show All Product into CART
// router.get('/:id', userAuth, displayCart);

//// Delete Product from CART
// router.delete('/items/:id/cartId/:cart_id', userAuth, deleteItem);

////    Delete CART  
// router.delete('/:id', userAuth, deleteCart);    /// Delete CART
module.exports = router;
