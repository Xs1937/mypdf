import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import Router from "vue-router";
import router from "./routes";
Vue.use(Router);


import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
Vue.use(ElementUI);

new Vue({
    render: h => h(App),
    router,
    store
}).$mount("#app");
