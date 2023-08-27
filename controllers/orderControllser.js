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
const get_order = async (_id) => {
    try {
        return await Order.findById(_id).populate('service_category');
    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
    }
}

const active_order = async () => {
    try {
        return await Order.find({ is_finished: false, active_order: true });
    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
    }
}

const pricing_order = async (data) => {
    try {
        let _id = data._id;
        let price = data.price
        let payment = await Order.findByIdAndUpdate(_id, {
            payment_price: price
        });
        return payment
    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });

    }
}

const ordering_message_id = async (data) => {
    try {
        let _id = data._id;
        let { payment_message_id } = data;
        await Order.findByIdAndUpdate(_id, {
            payment_message_id: payment_message_id
        });
    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
    }
}

const finish_order = async (order_id) => {
    try {
        let exist_order = await Order.find({
            is_finished: false,
            _id: order_id

        });

        if (exist_order.length == 1) {
            if (exist_order[0].is_payment) {
                await Order.findByIdAndUpdate(order_id, {
                    is_finished: true
                });
                return true
            } else {
                return false
            }

        } else {
            return false
        }
    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
    }
}

const find_order_for_payment = async (msg_id) => {
    try {
        return await Order.find({ payment_message_id: msg_id, is_finished: false, is_payment: false }).populate('service_category');
    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
    }
}

const check_payment_order = async (_id) => {
    try {
        return await Order.find({ _id, is_finished: false, is_payment: false, active_order: true })
    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
    }
}

const paymenting_order = async (_id) => {
    try {
        let exist_order = await Order.findById(_id);
        if (exist_order) {
            await Order.findByIdAndUpdate(_id, {
                is_payment: true
            });

            return exist_order
        } else {
            return exist_order
        }

    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
    }
}

const reject_order_info = async (_id) => {
    try {
        return await Order.find({_id, is_payment:false, active_order:true,is_finished: false})
    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
    }
}

const reject_order = async(_id)=>{
    try{
        let exist_order = await Order.find({_id, is_payment:false, active_order:true,is_finished: false});
        if(exist_order.length ==1){
            await Order.findByIdAndUpdate(_id, {
                active_order: false
            });
            return exist_order
        }else{
            return []
        }
    }catch (error) {
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
    get_order,
    pricing_order,
    ordering_message_id,
    finish_order,
    find_order_for_payment,
    check_payment_order,
    paymenting_order,
    reject_order_info,
    reject_order
}