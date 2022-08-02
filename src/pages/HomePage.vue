<template>
	<a-tabs centered v-model:activeKey="activeKey" type="card">
		<a-tab-pane :key="Tabs.InitMsig" tab="Init multisigTxn">
			<InitMsig />
		</a-tab-pane>
		<a-tab-pane :key="Tabs.Msig" tab="MultiSig">
			<msig />
		</a-tab-pane>
		<a-tab-pane :key="Tabs.TxSender" tab="Tx Sender">
			<sender />
		</a-tab-pane>
	</a-tabs>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import { Tabs } from "@/types";
import Msig from "./MsigUI.vue";
import Sender from "./TxSender.vue";
import InitMsig from "./InitMsig.vue";

export default defineComponent({
	components: {
		Msig,
		Sender,
		InitMsig,
	},
	setup() {
		return {
			activeKey: ref(Tabs.Msig),
			Tabs,
		};
	},
});
</script>
