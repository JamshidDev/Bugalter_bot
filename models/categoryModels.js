const mongoose = require("mongoose");


const categorySchema = mongoose.Schema({
        name_uz: {
            type: String,
            required: true,
        },
        name_ru: {
            type: String,
            required: true,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: {
            createdAt: "created_at", // Use `created_at` to store the created date
            updatedAt: "updated_at", // and `updated_at` to store the last updated date
        },
    });


const Category = mongoose.model("Category", categorySchema);
module.exports = {Category}