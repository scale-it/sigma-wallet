<template>
	<a-page-header>
		<template #title>
			<img src="../assets/SigmaWallet.png" class="logo" />
		</template>
		<template #extra>
			<WalletConnectVue />
		</template>
	</a-page-header>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import WalletConnectVue from "./WalletConnect.vue";

export default defineComponent({
	name: "App",
	components: { WalletConnectVue },
});
</script>
