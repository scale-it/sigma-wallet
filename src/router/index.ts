import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../pages/HomePage.vue";

const routes = [
	{
		path: "/",
		name: "HomePage",
		component: HomePage,
		props: true,
	},
];

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes,
});

export default router;
