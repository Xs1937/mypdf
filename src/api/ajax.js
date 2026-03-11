import axios from "axios";

export default function Send (
    {
        url,
        data,
        method = "get",
        headers,
        timeout,
        responseType,
        withCredentials,
        postType = "json"
    }
) {
    let commonHeaders = {
        "Content-Type": "application/json;charset=utf-8"
    };

    let conifg = {
        method: method || "get",
        url: url,
        data: method === "post" ? data : {},
        params: method === "get" ? data : {},
        headers: headers ? Object.assign(commonHeaders, headers) : commonHeaders,
        timeout: timeout || 180000,
        withCredentials: withCredentials || true,
        responseType: responseType || "json",
        crossDomain: true
    };

    if (postType === "form") { // form表单上传的 （常用于文件上传）
        const param = new FormData();

        for (let key in data) {
            if (key === "files") {
                data[key].forEach(a => {
                    param.append(key, a, a.name);
                })
            } else {
                param.append(key, data[key]);
            }
        }

        conifg.data = param;
        config.method = "post";
        config.params = null;
    }

    let ajax = axios(config).then(res => {
        return res;
    }).catch(err => {
        // 处理失败的逻辑（比如 没有token、或者服务端的一些错误）
    });

    return ajax;
}
