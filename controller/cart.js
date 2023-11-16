const model = require('../model/cart');
const userModel = require('../model/userModel');
const productModel = require('../model/product')
const inventoryModel = require('../model/inventory')
const mongoose = require('mongoose')

const ErrorHandler = require('../utils/errorHandling');
const cartModel=require('../model/cart')
const asyncCatchHandler = require('../middleware/catchAsyncError')

/// Create CART
exports.createCart = asyncCatchHandler(async (req, res, next) => {
    const {user_id}=req.body;
const users=await userModel.findOne({_id:mongoose.Types.ObjectId(user_id),user_status:'Active'})
const userCart=await cartModel.findOne({user_id:mongoose.Types.ObjectId(user_id),cart_status:'Active'})
if(!users){
    return next(new ErrorHandler('User not found ', 422))
}
if(userCart){
    return res.json({
        success:true,
        message:'User has already created CART'
    })
}
const cart=await cartModel({
    user_id:user_id,
    
})

cart.save();

return res.json({
    success:true,
    message:'cart is created successfully'
})
})

exports.addProduct = asyncCatchHandler(async (req, res, next) => {
    const {user_id,product_id,product_quanity}=req.body;
    
const users=await userModel.findOne({_id:mongoose.Types.ObjectId(user_id),user_status:'Active'})
const userCart=await cartModel.findOne({user_id:mongoose.Types.ObjectId(user_id),cart_status:'Active'})
const product=await productModel.findOne({_id:mongoose.Types.ObjectId(product_id),product_status:'Active'})
const userProduct=await cartModel.findOne({cart_status:'Active',user_id:mongoose.Types.ObjectId(user_id),'products.product_id':mongoose.Types.ObjectId(product_id)})
if(!users){
    return next(new ErrorHandler('User not found ', 404))
}
if(!userCart){
    return next(new ErrorHandler('User cart not found', 404))
}

if(!product){
    return next(new ErrorHandler('product not found', 404))   
}
if(userProduct){
    return next(new ErrorHandler('User have already this product in CART', 200))  
}
if(product_quanity<=0){
    return next(new ErrorHandler('Product must have atleast 1 quantity ', 200))   
}

userCart.products.push({
product_id:product_id,
product_quantity:product_quanity
})
await userCart.save()
return res.json({
    success:true,
    message:'Product is added into CART successfully',
    data:userCart
})
})

exports.increaseProduct = asyncCatchHandler(async (req, res, next) => {
    const {user_id,product_id,product_quantity,cart_id}=req.body;
    
const userProduct=await cartModel.findOne({_id:mongoose.Types.ObjectId(cart_id),cart_status:'Active','products.product_id':mongoose.Types.ObjectId(product_id)})
if(!userProduct){
    return next(new ErrorHandler('This product not found in CART', 200))  
}

const data=await cartModel.findOneAndUpdate({_id:mongoose.Types.ObjectId(cart_id), 'products.product_id': mongoose.Types.ObjectId(product_id) }, {
    $inc:{
        'products.$.product_quantity':product_quantity
    }
})



return res.json({
    success:true,
message:'Product quantity is added successfully',
    data
  
})
})

exports.decreaseProduct = asyncCatchHandler(async (req, res, next) => {
    const {user_id,product_id,product_quantity,cart_id}=req.body;
    
   
const userProduct=await cartModel.findOne({_id:mongoose.Types.ObjectId(cart_id),cart_status:'Active','products.product_id':mongoose.Types.ObjectId(product_id)})
if(!userProduct){
    return next(new ErrorHandler('This product not found in CART', 200))  
}

const data=await cartModel.findOneAndUpdate({_id:mongoose.Types.ObjectId(cart_id), 'products.product_id': mongoose.Types.ObjectId(product_id) }, {
    $inc:{
        'products.$.product_quantity':- product_quantity
    }
})

   const data2=await cartModel.findOne({_id:mongoose.Types.ObjectId(cart_id),'products.product_id':mongoose.Types.ObjectId(product_id),'products.product_quantity':{$lte:0}})

  if(data2){
   await cartModel.updateOne(
      { _id: mongoose.Types.ObjectId(cart_id),'products.$.product_id':mongoose.Types.ObjectId(product_id),
    'products.$.product_quanity':{lte:0} },
      { $pull: { 'products': { product_id: mongoose.Types.ObjectId(product_id) } } }
  )
   }



return res.json({
    success:true,
message:'Product quantity is removed successfully',
    data
  
})
})

exports.displayCartProduct = asyncCatchHandler(async (req, res, next) => {
    const {user_id}=req.params;
 const data=await cartModel.findOne({user_id:mongoose.Types.ObjectId(user_id),cart_status:'Active'}).populate('products.product_id')

 if(!data){
    return next(new ErrorHandler('user cart not found', 200))   
 }
return res.json({
    success:true,

    data
  
})
})


//

exports.addProductsInCart= asyncCatchHandler(async (req, res, next) => {
    const users=await userModel.findOne({_id:mongoose.Types.ObjectId(user_id),user_status:'Active'})
    if(!users){
        return next(new ErrorHandler('User not found is not found', 404))
    }
    const cart=await cartModel({
    
        user_id:user_id
    })
    
    cart.save();
    
    return res.json({
        success:true,
        message:'cart is created successfully'
    })
    })














////////////////
exports.deleteCart = async (req, res) => {
    try {
        const { id } = req.params;

        const deleteCart = await model.findByIdAndDelete(id);

        if (!deleteCart) {
            return res.json({
                success: false,
                message: "No Cart found"
            })
        }

        res.json({
            success: true,
            message: "CART is deleted successfully"
        })
    }
    catch (err) {
        res.json({
            message: err.message
        })
    }
}

//////  ADD Empty CART //////
exports.addCart = async (req, res) => {
    try {
        const user_id = req.body.user_id


        const cartModel = await new model({
            user_id: user_id,
        })

        cartModel.save();

        res.json({
            success: true,
            message: 'CART is Created successfully'
        })
    }
    catch (err) {
        res.json({
            success: false,
            message: err.message
        })
    }
}
//////  ADD Empty CART //////





/// Display All Product from Cart 
exports.displayCart = async (req, res) => {
    try {
        const id = req.params.id;


        // console.log(dataModel, "DataModel")
        const display = await model.findById(id)

        if (!display) {
            return res.json({
                success: false,
                message: 'Cart not found'
            })
        }
        const dataModel = await model.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(id)
                }
            }, {
                $addFields: {
                    total: {
                        $reduce: {
                            input: '$cart',
                            initialValue: 0,
                            'in': {
                                $add: [
                                    '$$value',
                                    '$$this.total'
                                ]
                            }
                        }
                    }
                }
            }])

        const TotalPrice = dataModel[0].total
        return res.json({
            success: true,
            display,
            TotalPrice
        })
    }
    catch (err) {
        res.json({
            success: false,
            message: err.message
        })
    }
}
/// Display All Product from Cart 



///////   Delete Product from CART   ///////
exports.deleteItem = async (req, res) => {
    try {
        const productId = req.params.id;
        const cart_id = req.params.cart_id;
        if (!productId || !cart_id) {
            return res.json({
                success: false,
                message: "No Cart or Item found"
            })
        }

        const cartItem = await model.findById({ _id: cart_id })
        if (!cartItem) {
            return res.json({
                success: false,
                message: 'No Cart Found'
            })
        }
        const data = await model.aggregate([{
            $unwind: {
                path: '$cart',
                includeArrayIndex: 'string',
                preserveNullAndEmptyArrays: true
            }
        }, {
            $project: {
                'cart.product_id': 1
            }
        }, {
            $match: {
                'cart.product_id': mongoose.Types.ObjectId(productId)
            }
        }])

        if (data.length < 1) {
            return res.json({
                success: false,
                message: 'Item not found'
            })
        }
        const response = await model.updateOne(
            { _id: mongoose.Types.ObjectId(cart_id) },
            { $pull: { 'cart': { product_id: mongoose.Types.ObjectId(productId) } } }
        )
        return res.json({
            success: true,
            message: 'Item is deleted successfully'
        })
    } catch (err) {
        return res.json({
            success: false,
            message: err.message
        })
    }
    // deleteItem > deleteItem.ca

    // deleteItem.cart.forEach(data => {
    //     if()
    //     console.log("data", data.product_id)
    // })

}
///////   Delete Product from CART   ///////



////////  main Add An update  to Cart Feature Code
exports.updateCart = async (req, res, next) => {
    try {
        const { user_id, cart_id, cart } = req.body;
        if (!user_id) {
            return next(new ErrorHandler('User Id must be required', 404))
        }
        if (!cart || cart && cart.length < 1) {
            return next(new ErrorHandler('Cart must have atleast 1 Product', 404))
        }
        const productId = cart[0].product_id

        var count = 0
        cart.forEach(data => {
            if (data.quantity < 1) {
                count++
            }
        })
        if (count >= 1) {
            return next(new ErrorHandler('Product must have atleast one quantity', 404))
        }


        const inventorySystem = await inventoryModel.find({ product_id: productId })
        if (inventorySystem.length == 0 || inventorySystem[0].quantity < cart[0].quantity) {
            return res.json({
                success: false,
                message: 'Item is out of stock'
            })
        }

        const user = await model.find({ user_id: user_id });
        if (user && user.length < 1) {


            const total = Number(cart[0].price) * Number(cart[0].quantity)
            const data = [{
                product_id: cart[0].product_id,
                quantity: cart[0].quantity,
                price: cart[0].price,
                total: Number(cart[0].price) * Number(cart[0].quantity)
            }]

            const modelCart = await new model({
                user_id,
                cart: data
                // total

            })

            modelCart.save()
           
            return res.json({
                success: true,
                message: 'Item is added successfully'
            })
        }
        else {
            const aggregateModel = await model.aggregate([{
                $match: {
                    user_id: mongoose.Types.ObjectId(user_id)
                }
            }, {
                $unwind: {
                    path: '$cart',
                    includeArrayIndex: 'string',
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $match: {
                    'cart.product_id': mongoose.Types.ObjectId(productId)
                }
            },

            ])

            if (aggregateModel.length > 0) {

                model.updateOne({ 'cart.product_id': mongoose.Types.ObjectId(productId) }, {
                    '$set': {
                        'cart.$.quantity': Number(cart[0].quantity),
                        'cart.$.price': Number(cart[0].price),
                        'cart.$.total': Number(cart[0].quantity) * Number(cart[0].price),

                    }
                }).then(data => {
                    if (data.matchedCount == 0) {
                        return res.json({
                            success: false,
                            message: 'No Item Found '
                        })
                    }
                    //  console.log("", data)).catch(err => console.log(err))
                    return res.json({
                        success: true,
                        message: 'Item is updated successfully',

                    })

                })
            } else {


                const data1 = [{
                    product_id: cart[0].product_id,
                    quantity: cart[0].quantity,
                    price: cart[0].price,
                    total: Number(cart[0].price) * Number(cart[0].quantity)
                }]
                const data = model.findOneAndUpdate({ user_id: user_id }, {
                    $push: { cart: data1 },
                }).then(data => {
                    data.save()

                    return res.json({
                        success: true,
                        message: 'Product is added successfully'
                    })
                }).catch(err => res.json(err.message))

            }

        }
    }
    catch (err) {
        res.json({
            success: false,
            message: err.message
        })
    }
}