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

const register_admin = async(payload)=>{
    return await axios.post(`/bot/admin`, payload.data).then((res) => {
        return [null, res.data]
    }).catch((error) => {
        return [error, null]
    })
}
const remove_admin =async (payload) => {
    return await axios.delete(`/bot/admin/${payload}`).then((res) => {
        return [null, res.data]
    }).catch((error) => {
        return [error, null]
    })
}

const premium_services = async (payload)=>{
    return await axios.get(`/bot/services`).then((res) => {
        return [null, res.data]
    }).catch((error) => {
        return [error, null]
    })
}

const search_bank = async (payload)=>{
    return await axios.get(`/bot/bank/${payload.debet}/${payload.kredit}`).then((res) => {
        return [null, res.data]
    }).catch((error) => {
        return [error, null]
    })
}






module.exports = {search_bank, premium_services,register_admin,remove_admin, get_user_list,register_user, remove_user}