const mongoose = require("mongoose");

const bankSchema = mongoose.Schema({
    number:{
        type: Number,
        required: true,
    },
    debet: {
        type: Number,
        required: true,
    },
    kredit: {
        type: Number,
        required: true,
    },
    result_uz: {
        type: String,
        required: true
    },
    result_ru: {
        type: String,
        default: null,
    },
    active:{
        type:Boolean,
        default:true
    }
}, {
    timestamps: {
        createdAt: 'created_at', // Use `created_at` to store the created date
        updatedAt: 'updated_at' // and `updated_at` to store the last updated date
    }
})


const Bank = mongoose.model("Bank", bankSchema);

module.exports = {Bank}