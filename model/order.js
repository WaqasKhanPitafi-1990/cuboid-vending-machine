const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({

    canteen_id: {
        type: mongoose.Types.ObjectId,
        ref: 'canteen',
        required: [true, 'Canteen id is required']
    },
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },
    subsidy: {
        type: Number,
        default: 0
    },
    subsidy_points: {
        type: Number,
        default: 0
    },
    subsidy_points_to_refund: {
        type: Number,
        default: 0
    },
    subsidy_points_refunded: {
        type: Boolean,
        default: false
    },
    order_status: {
        type: String,
        required: [false, 'Order status is required'],
        enum: ['pending', 'captured', 'cancelled', 'delivered', 'processing','delivery_started','delivered_partially'],
        default: 'pending'
    },

    payment_method: {
        type: String,
        enum: ['vipps', 'stripe','subsidy'],
        required: false
    },
    payment_status: {
        type: String,
        enum: ['RESERVED', 'SALE', 'RESERVE_FAILED', 'SALE_FAILED', 'CANCELLED', 'REJECTED', 'RESERVE', 'PENDING', 'REFUNDED', 'PARTIALLY_REFUNDED', 'VOID'],
        default: 'PENDING'
    },
    products: [
        {
            machine_id: {
                type: mongoose.Types.ObjectId,
                ref: 'machine'
            },
            productId: {
                type: mongoose.Types.ObjectId,
                required: [true, 'Product id is required']
            },
            product_name: {
                type: String,
                required: [true, 'Product name is required']
            },
            product_price: {
                type: Number,
                required: [true, 'Product price is required']
            },
            product_quantity: {
                type: Number,
                required: [true, 'Product quantity is required']
            },
            deliveryStatus: {
                type: [String],
                enum: ['queued', 'received', 'in process', 'product ready to be collected', 'delivered', 'failed'],
                required: [false, 'Delivery status is required'],
                default: 'queued'
            },
            machineNumber: {
                type: Number,
                required: [true, 'Machine number is required']
            },
            trayNumber: {
                type: Number,
                required: [true, 'Tray number is required']
            },
            channelNumber: {
                type: Number,
                required: [true, 'Channel number is required']
            },
            extractionTime: {
                type: Number,
                required: [true, 'Extraction time is required']
            },
            product_VAT: {
                type: Number,
                required: [true, 'Product VAT is required']
            },
            discount_type: {
                type: String,
                default:''

            },
            vat_percentage: {
                type: Number,
                default: 0
            },
            per_product_discount: {
                type: Number,
                default: 0
            },
            mapped_tray_number: {
                type: Number,
                default: 11
              },
            mapped_channel_number: {
            type: Number,
            default: 1
            },
            dispensing_speed:{
            type:Number,
            default:0
            },
            channel_id: {
                type: mongoose.Types.ObjectId,
                required: [true, 'Product id is required']
            },

        }
    ],

    discount: {
        type: Number,
        default: 0
    },
    promotion: {
        type: Number,
        required: false,//[true, 'Promotion is required']
        default: 0
    },
    promotion_type: {
        type: 'string',
        required: false,
        default:''
    },
    total_price: {
        type: Number,
        required: [true, 'Total price is required']
    },
    total_VAT: {
        type: Number,
        default: 0
    },
    total_price_prior_deductions: {
        type: Number,
        required: [true, 'Total Price Prior Deductions is required']
    },
    chargeAblePayment: {
        type: Number,
        default: 0,
        required: false
    },
    cancelledPayment: {
        type: Number,
        default: 0,
        required: false
    },

    paymentIntents: {
        type: String,
        required: false
    },
    dispenseStartedOn: {
        type: Date,
        required: false
    }

}, { timestamps: true });

const OrderModel = mongoose.model('order', orderSchema);

module.exports = { orderSchema, OrderModel };