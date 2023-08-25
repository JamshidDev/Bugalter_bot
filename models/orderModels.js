const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    service_category: {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
    },
    edsp_key: {
        type: String,
        required: true
    },
    edsp_cer: {
        type: String,
        required: true
    },
    task_file: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    comment: {
        type: String,
    },
    client_id: {
        type: Number,
        required: true,
    },
    order_number :{
        type:Number,
        required: true
    },
    // optional properties
    is_payment: {
        type: Boolean,
        default: false,
    },
    payment_price:{
        type: Number,
        default: 0,
    },
    payment_message_id:{
        type: Number,
        default: 0,
    },
    is_finished: {
        type: Boolean,
        default: false,
    },
    active_order: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: {
        createdAt: 'created_at', // Use `created_at` to store the created date
        updatedAt: 'updated_at' // and `updated_at` to store the last updated date
    }
})

const Order = mongoose.model('Order', orderSchema);
module.exports = { Order }