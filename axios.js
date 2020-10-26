import axios from 'axios';
import { Toast } from 'vant';
import { url } from "@/assets/js/config";
import Vue from 'vue';
import store from '@/vue/vuex/store'

let instance = axios.create({
    timeout: 20000,
    baseURL: process.env.NODE_ENV === "development" ? "" : "",
    withCredentials: true // 允许携带cookie
});

instance.interceptors.request.use((config) => {
    if (config.method === 'post' || config.method === 'put') {
        if(!config.headers["Content-Type"]){
            config.headers["Content-Type"] = "application/json;";
        }

        config.data = JSON.stringify(config.data);
    }
    return config;
}, (err) => {
    return Promise.reject(err);
});

instance.interceptors.response.use((res) => {
    if (res.data.code != 0) {
        if (res.data.code == 700) { //当前用户未登录
            Vue.prototype.$getLigin()
        } else {
            // 设置了hiddenError的不提示
            if ((!res.config.hiddenError) && res.data.errorMessage && res.data.code != 103) {
                Vue.prototype.$dialog.alert({
                    title: '提示',
                    message: res.data.errorMessage
                })
            }
        }
        return Promise.reject(res);
    }
    return res;
}, (error) => {
    if (error.message == 'timeout of 5000ms exceeded') {
        return Promise.reject(error);
    }

    return Promise.reject(error);
});

const post = (reqUrl, data, config = {}, authToken) => {
    reqUrl = url().baseUrl + reqUrl
    return instance.post(reqUrl, data, config, authToken)
}

const put = (url, data, config = {}) => {
    return instance.put(url, data, config)
}

const get = (url, params, config = {}) => {
    return instance.get(url, {
        params: params,
        ...config
    })
}

const deleteMethod = (url, config = {}) => {
    return instance({
        url: url,
        method: 'delete',
        ...config
    })
}

export default {
    install(Vue) {
        Object.defineProperties(Vue.prototype, {
            $reqGet: {
                value: get
            },
            $reqPost: {
                value: post
            },
            $reqPut: {
                value: put
            },
            $reqDel: {
                value: deleteMethod
            },
        })
    }
}
