import Router from "vue-router";

const router =new Router({
    mode: "hash", // 如果使用history 则需使用后端服务器（比如node或者nginx）,否则会返回404
    routes: [
        {
            path: "/",
            component: () => import("@/pages/index/index.vue"),
            meta: {
                title: "首页",
                auth: false
            }
        },
        {
            path: "/index",
            redirect: "/"
        },
        {
            path: "/admin",
            component: () => import("@/pages/admin/index.vue"),
            meta: {
                title: "admin",
                auth: false
            }
        }
    ]
});

export default router;
