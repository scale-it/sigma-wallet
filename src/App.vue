<template>
	<div class="app_root">
		<WalletConnectVue />
		<div class="margin_top_sm">
			<router-view />
		</div>
		<AppFooter />
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import AppFooter from "./components/AppFooter.vue";
import WalletConnectVue from "./components/WalletConnect.vue";

export default defineComponent({
	name: "App",
	components: { AppFooter, WalletConnectVue },
});
</script>

<style>
@import "./styles/style.css";
</style>
