const axios = require("axios");

const instance = axios.create({
    baseURL: 'http://54.236.251.172:5000'
});
instance.interceptors.request.use(function (config) {
    // let token = localStorage.getItem('access_token') ? localStorage.getItem('access_token') : null;
    // if (true) {
    //     config.headers['Access-Control-Allow-Origin'] = '*'
    //     config.headers['Authorization'] = 'Bearer ' + '55280|laravel_sanctum_gt74mfMNkmxoL7MGhIuZHNownO7USuScoqCZU901d78dc6f8'
    // }
    return config;
})
instance.interceptors.response.use(
    response => response,
    error => {
        return Promise.reject(error)
    }
);

module.exports = instance