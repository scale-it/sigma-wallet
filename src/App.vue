<template>
	<div class="app_root">
		<AppHeader />
		<div class="margin_top_sm">
			<router-view />
		</div>
		<AppFooter />
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import AppFooter from "./components/AppFooter.vue";
import AppHeader from "./components/AppHeader.vue";

export default defineComponent({
	name: "App",
	components: { AppFooter, AppHeader },
});
</script>

<style>
@import "./styles/style.css";
</style>
