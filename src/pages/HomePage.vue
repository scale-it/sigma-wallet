<template>
	<a-tabs centered v-model:activeKey="activeKey" type="card">
		<a-tab-pane :key="Tabs.InitMsig" tab="Init MultiSig Txn">
			<InitMsig :onHomeTabChange="(value:number) => changeTab(value)" />
		</a-tab-pane>
		<a-tab-pane :key="Tabs.Msig" tab="MultiSig">
			<msig :onHomeTabChange="(value:number) => changeTab(value)" />
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
			activeKey: ref(Tabs.InitMsig),
			Tabs,
		};
	},
	methods: {
		changeTab(value: Tabs) {
			this.activeKey = value;
		},
	},
});
</script>
