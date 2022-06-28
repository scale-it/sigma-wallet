<template>
	<a-layout-content class="content_sign">
		<a-row>
			<a-col :xs="{ span: 24 }" :lg="{ span: 10 }">
				<h1>Transaction Input</h1>
				<a-switch
					v-model:checked="isJsonSelected"
					checked-children="json"
					un-checked-children="msgpack"
				/>
				<a-textarea
					class="margin_top_med"
					v-model:value="txInput"
					:rows="20"
					allow-clear
				/>
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
			<a-col :xs="{ span: 24 }" :lg="{ span: 12, offset: 2 }">
				<h1>Transaction preview</h1>
				<a-textarea
					:style="
						txOutput.length &&
						'background-color: white !important; color: black !important'
					"
					auto-size
					:bordered="false"
					v-model:value="txOutput"
					:disabled="true"
				/>
				<a-button
					class="margin_top_med"
					type="primary"
					@click="openConfirmationModal"
					:disabled="!txOutput"
					>Send</a-button
				>
			</a-col>
		</a-row>
	</a-layout-content>
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
					this.txOutput = "";
					this.txInputError = "Please input valid JSON transaction";
				}
			} else {
				console.log("msgpack");
			}
			if (!this.txInput && this.txOutput) {
				this.txOutput = "";
				this.txInputError = "";
			}
		},
	},
});
</script>
