const { Order } = require("../models/orderModels");
const customLogger = require("../config/customLogger");

const create_order = async (data, ctx) => {
    try {
        let count = await Order.find().countDocuments();
        data.order_number = count + 1;
        await Order.create(data);
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


module.exports = {
    create_order,
    order_list,
}