import Vue, { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./router";
import Antd from "ant-design-vue";
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import "ant-design-vue/dist/antd.css";
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

const app = createApp(App);
app.use(Antd).use(createPinia()).use(router).mount("#app");
