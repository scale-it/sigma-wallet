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
		checked-children="msgpack"
		un-checked-children="json"
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
			<a-textarea :bordered="false" v-model:value="txOutput" :disabled="true" />
		</a-col>
	</a-row>
	<a-row class="margin_top_large">
		<a-col :span="4">
			<div>
				<a-button type="primary" @click="sendTx">Send</a-button>
			</div>
		</a-col>
	</a-row>
</template>

<script>
import { defineComponent, createVNode } from "vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";

export default defineComponent({
	data() {
		return {
			isJsonSelected: false,
			txInput: "",
			txOutput: "",
			txInputError: "",
		};
	},
	setup() {
		const confirm = () => {
			Modal.confirm({
				title: "Confirm",
				icon: createVNode(ExclamationCircleOutlined),
				okText: "Ok",
				cancelText: "Cancel",
				centered: true,
				onOk: () => {
					console.log("send transaction");
				},
			});
		};
		return {
			confirm,
		};
	},
	methods: {
		sendTx() {
			if (!this.txInput) {
				this.txInputError = "Please input your transaction";
			} else this.confirm();
		},
	},
	watch: {
		txInput() {
			if (this.txInput && this.txInputError) {
				this.txInputError = "";
			}
		},
	},
});
</script>
