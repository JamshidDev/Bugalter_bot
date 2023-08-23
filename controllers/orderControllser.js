const { Order } = require("../models/orderModels");
const customLogger = require("../config/customLogger");

const create_order = async (data, ctx) => {
    try {
        let count = await Order.find().countDocuments();
        data.order_number = count + 1;
        let order = await Order.create(data);
        return order
    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
    }
}

const order_list = async () => {
    try {
        const orders = await Order.find().exec();
        return orders

    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
    }
}

const active_order = async () => {
    try {
        return await Order.find({is_finished:false, active_order:true})
    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
    }
}


module.exports = {
    create_order,
    order_list,
    active_order,
}