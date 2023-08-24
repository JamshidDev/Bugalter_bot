const mongoose = require('mongoose');

const payment = mongoose.Schema({
    client_id: {
        type: Number,
        required: true,
    },
    order_id: {
        type: mongoose.Schema.ObjectId,
        ref: "Order",
    },
    payment_amount: {
        type: Number,
        required: true,
    }
}, {
    timestamps: {
        createdAt: 'created_at', // Use `created_at` to store the created date
        updatedAt: 'updated_at' // and `updated_at` to store the last updated date
    }
})