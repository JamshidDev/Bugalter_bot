const { User } = require("../models/userModels");
const customLogger = require("../config/customLogger");




const userRegister = async (data, ctx) => {
    try {
        const { user_id } = data;
        let exist_user = await User.findOne({ user_id }).exec();

        if (!exist_user) {
            await User.create(data)
        } else {
            let _id = exist_user._id;
            await User.findByIdAndUpdate(_id, data);
        }

    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
    }
}


const removeUser = async (data, ctx) => {

    try {
        let { user_id } = data;
        let exist_user = await User.findOne({ user_id }).exec();

        if (exist_user) {
            let _id = exist_user._id;
            await User.findOneAndRemove(_id);
        } else {
            console.log("User not found for deleteing --->")
        }
    } catch (error) {
        customLogger.log({
            level: 'error',
            message: error
        });
    }


}

// const add_new_feild = async () => {

//     try {
//         let users = await User.updateMany({},{ $set: { lang: null } },);
//         console.log(users);
//     } catch (error) {
//         console.log(error);
//     }
// }


const get_user_lang = async(user_id)=>{
    try{
        // return await User.findOne({user_id});
        return []
    }catch(error){
        customLogger.log({
            level: 'error',
            message: error
        });
    }
}

const update_user_lang = async(data)=>{
    try{
       await User.findOneAndUpdate({user_id:data.user_id}, {
            lang:data.lang
        });
    }catch(error){
        customLogger.log({
            level: 'error',
            message: error
        });
    }
}


module.exports = {
    userRegister,
    removeUser,
    get_user_lang,
    update_user_lang
   
}




