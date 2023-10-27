const axios = require("../index");



const get_user_list =async (payload) => {
    return await axios.get(`/bot/member`).then((res) => {
        return [null, res.data]
    }).catch((error) => {
        return [error, null]
    })
}


const register_user =async (payload) => {
    return await axios.post(`/bot/member/create`, payload.data).then((res) => {
        return [null, res.data]
    }).catch((error) => {
        return [error, null]
    })
}

const remove_user =async (payload) => {
    return await axios.delete(`/bot/member/delete/${payload}`).then((res) => {
        return [null, res.data]
    }).catch((error) => {
        return [error, null]
    })
}




module.exports = {get_user_list,register_user, remove_user}