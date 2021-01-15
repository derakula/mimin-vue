import axios from 'axios'
import store from "../store";
import { API_BASE_PATH } from "../config/app.config";
import qs from 'qs';

//axios.defaults.withCredentials = true;
const request = axios.create({
    baseURL: API_BASE_PATH, // url = base url + request url
    // send cookies when cross-domain requests
    // timeout: 5000 // request timeout
});

/**
 * Request to bring token
 */
request.interceptors.request.use(function (config) {
    config.headers = {
        ...(store.state.user.token ? { Authorization: 'Bearer ' + store.state.user.token } : {}),
        ...(config.headers || {})
    };
    if (config.method === 'get') {
        config.paramsSerializer = function (params) {
            return qs.stringify(params, { arrayFormat: 'repeat' })
        }
    }
    return config
}, function (err) {
    return Promise.reject(err)
});

/**
 * Processing response
 */
request.interceptors.response.use(function (res) {
    //If it is a download file, return directly
    if (res.request.responseType === 'blob') {
        return res;
    }
    /*if (res.data.code !== 0) {
        return Promise.reject(res.data)
    }*/
    return res.data;
}, function (err) {
    return Promise.reject(err)
});

export default request;

export const download = (url, filename = '') => {
    request.get(`${url}?fileName=${filename}`, { responseType: 'blob' }).then(response => {
        const blob = new Blob([response.data]);
        const tempLink = document.createElement('a'); // Create a tag
        const href = window.URL.createObjectURL(blob); // Create download link
        //filename
        const fileName = decodeURI(response.headers['content-disposition'].split('filename=')[1]);
        tempLink.href = href;
        tempLink.target = "_blank";
        tempLink.download = fileName;
        document.body.appendChild(tempLink);
        tempLink.click(); // click to download
        document.body.removeChild(tempLink); // remove the element after downloading
        window.URL.revokeObjectURL(href) // release the blob object
    })
};