const { Category } = require("../models/categoryModels");
const customLogger = require("../config/customLogger");


const add_category = async (data, ctx) => {
    try {
        await Category.create(data);
    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
    }
}


const remove_category = async (data, ctx) => {
    try {
        let _id = data._id;
        let exist_category = await Category.findById(_id).exec();
        if (exist_category) {
            let _id = exist_category._id;
            await Category.findOneAndRemove(_id);
        } else {
            console.log("Category not found for deleteing --->")
        }

    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
    }
}


const category_list = async () => {
    try {
        let category_list = await Category.find({});
        return category_list;

    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
    }
}

module.exports = { add_category, remove_category, category_list }


