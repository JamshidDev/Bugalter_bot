const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    user_id:{
        type:Number,
        required:true,
        unique: true,
    },
    firstname:String,
    username:String,
    active_user:{
        type:Boolean,
        default:true
    }
})


const User = mongoose.model('User', userSchema);
module.exports = {User}