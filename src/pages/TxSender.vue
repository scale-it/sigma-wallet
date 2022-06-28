<template>
	<a-row>
		<a-col :span="10">
			<h2>Transaction Input</h2>
		</a-col>
		<a-col :offset="4" :span="10">
			<h2>Transaction preview</h2>
		</a-col>
	</a-row>
	<a-switch
		v-model:checked="isJsonSelected"
		checked-children="json"
		un-checked-children="msgpack"
	/>
	<a-row class="margin_top_med">
		<a-col :span="10">
			<a-textarea v-model:value="txInput" :rows="4" allow-clear />
			<div v-if="txInputError" class="margin_top_med">
				<a-alert
					message="Error"
					:description="txInputError"
					type="error"
					show-icon
					closable
					@close="txInputError = ''"
				/>
			</div>
		</a-col>

		<a-col :offset="4" :span="10">
			<a-textarea
				auto-size
				:bordered="false"
				v-model:value="txOutput"
				:disabled="true"
			/>
		</a-col>
	</a-row>
	<a-row class="margin_top_large">
		<a-col :offset="14" :span="4">
			<div>
				<a-button
					type="primary"
					@click="openConfirmationModal"
					:disabled="!txOutput"
					>Send</a-button
				>
			</div>
		</a-col>
	</a-row>
</template>

<script>
import { defineComponent, createVNode } from "vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";
import WalletStore from "@/store/WalletStore";

export default defineComponent({
	data() {
		return {
			isJsonSelected: true,
			txInput: "",
			txOutput: "",
			txInputError: "",
		};
	},
	setup() {
		const walletStore = WalletStore();
		const sendTx = async () => {
			console.log("send transaction");
		};
		const confirm = () => {
			Modal.confirm({
				title: "Confirm",
				icon: createVNode(ExclamationCircleOutlined),
				okText: "Ok",
				cancelText: "Cancel",
				centered: true,
				onOk: sendTx,
			});
		};
		return {
			confirm,
		};
	},
	methods: {
		isJson(str) {
			try {
				JSON.parse(str);
			} catch (e) {
				return false;
			}
			return true;
		},
		openConfirmationModal() {
			if (!this.txInput) {
				this.txInputError = "Please input your transaction";
			} else this.confirm();
		},
	},
	watch: {
		// update the preview whenever type is changed
		isJsonSelected() {
			this.txOutput = "";
		},
		txInput() {
			if (this.isJsonSelected) {
				if (this.isJson(this.txInput)) {
					this.txInputError = "";
					this.txOutput = JSON.stringify(JSON.parse(this.txInput), null, 4); // format JSON
				} else {
					this.txInputError = "Please input valid JSON transaction";
				}
			} else {
				console.log("msgpack");
			}
		},
	},
});
</script>
