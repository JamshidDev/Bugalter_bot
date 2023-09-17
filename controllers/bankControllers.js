const { Bank } = require("../models/bankModels");
const customLogger = require("../config/customLogger");

const add_bank = async (data) => {
    try {
        let { debet, kredit } = data;
        let exist_bank = await Bank.findOne({
            debet,
            kredit,
            active: true,
        })
        if (!exist_bank) {
            let count = await Bank.countDocuments({});
            data.number = count + 1;
            await Bank.create(data)
            return true
        } else {
            return false
        }

    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
        return false
    }
}


const search_bank = async (data) => {
    try {
        let { debet, kredit } = data
        return await Bank.find({
            debet,
            kredit
        })
    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
    }
}


const active_bank_list = async () => {
    try {
        return await Bank.find({
            active:true
        })

    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
    }
}














module.exports = { add_bank, search_bank, active_bank_list }