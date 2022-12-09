import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import CreateTxn from "../pages/CreateTxn.vue";
import { EndPoint } from "@/types";

const routes = [
	{
		path: EndPoint.HOME_PAGE,
		name: "HomePage",
		component: HomePage,
		props: true,
	},
	{
		path: EndPoint.CREATE_TXN,
		name: "CreateTxn",
		component: CreateTxn,
		props: true,
	},
];

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes,
});

export default router;
