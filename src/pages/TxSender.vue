<template>
	<a-layout-content class="content_sign">
		<a-row>
			<a-col :xs="{ span: 24 }" :lg="{ span: 10 }">
				<h1>Transaction Input</h1>
				<!-- TODO: Currently disabled for JSON -->
				<a-switch
					v-model:checked="isMsgPackSelected"
					checked-children="Base64 Msgpack"
					un-checked-children="JSON"
					:disabled="true"
				/>
				<a-textarea
					placeholder="Base64 msgpack or JSON object"
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
					:auto-size="{ maxRows: 22 }"
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

<script lang="ts">
import { defineComponent, createVNode } from "vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";
import WalletStore from "@/store/WalletStore";
import {
	isJson,
	convertBase64ToUnit8Array,
	formatJSON,
	convertObjectValuesToUnit8Array,
	convertToBase64,
} from "@/utilities";
import algosdk from "algosdk";
import {
	errorMessage,
	loadingMessage,
	openErrorNotificationWithIcon,
	openSuccessNotificationWithIcon,
	successMessage,
	TRANSACTION_SEND_SUCCESSFUL,
} from "@/constants";
import { WalletType } from "@/types";
import {
	MyAlgoWalletSession,
	WallectConnectSession,
	WebMode,
} from "@algo-builder/web";

export default defineComponent({
	data() {
		return {
			isMsgPackSelected: true,
			txInput: undefined,
			txOutput: "",
			txInputError: "",
			key: "SenderKey",
		};
	},
	setup() {
		const walletStore = WalletStore();
		return {
			walletStore,
		};
	},
	methods: {
		confirm() {
			Modal.confirm({
				title: "Confirm",
				icon: createVNode(ExclamationCircleOutlined),
				okText: "Ok",
				cancelText: "Cancel",
				centered: true,
				onOk: this.sendTx,
			});
		},
		formatConfirmedResponse(
			response: algosdk.modelsv2.PendingTransactionResponse
		) {
			this.txOutput = formatJSON(response);
			successMessage(this.key);
			openSuccessNotificationWithIcon(TRANSACTION_SEND_SUCCESSFUL);
		},
		displayError(error: Error) {
			errorMessage(this.key);
			openErrorNotificationWithIcon(error.message);
		},
		async sendTx() {
			loadingMessage(this.key);
			let encodedTx: Uint8Array | string;
			if (!this.txInput) return;
			// algosigner accepts base64 not unit8Array
			if (this.walletStore.walletKind === WalletType.ALGOSIGNER) {
				if (!this.isMsgPackSelected) {
					encodedTx = convertToBase64(
						convertObjectValuesToUnit8Array(JSON.parse(this.txInput)["blob"])
					);
				} else encodedTx = this.txInput;
			} else {
				if (!this.isMsgPackSelected) {
					// decode blob back to unit8Array
					encodedTx = convertObjectValuesToUnit8Array(
						JSON.parse(this.txInput)["blob"]
					);
				} else encodedTx = convertBase64ToUnit8Array(this.txInput);
			}
			try {
				let response;
				switch (this.walletStore.walletKind) {
					case WalletType.ALGOSIGNER: {
						const webmode = this.walletStore.webMode as WebMode;
						response = await webmode.sendAndWait(encodedTx as string);
						break;
					}
					case WalletType.MY_ALGO: {
						const algoWallet = this.walletStore.webMode as MyAlgoWalletSession;
						response = await algoWallet.sendAndWait(encodedTx as Uint8Array);
						break;
					}
					case WalletType.WALLET_CONNECT: {
						const walletConnect = this.walletStore
							.webMode as WallectConnectSession;
						response = await walletConnect.sendAndWait(encodedTx as Uint8Array);
						break;
					}
				}
				response && this.formatConfirmedResponse(response);
			} catch (error) {
				this.displayError(error);
			}
		},
		openConfirmationModal() {
			if (!this.txInput) {
				this.txInputError = "Please input your transaction";
			} else this.confirm();
		},
		handleInputPreviewChange() {
			if (this.txInput) {
				if (!this.isMsgPackSelected) {
					if (isJson(this.txInput)) {
						// JSON is valid
						this.txInputError = "";
						this.txOutput = formatJSON(JSON.parse(this.txInput)); // format JSON
					} else {
						// JSON is invalid
						this.txOutput = "";
						this.txInputError = "Please input valid JSON transaction";
					}
				} else {
					// msgpack is selected
					this.txInputError = "";
					if (this.txInput) {
						try {
							// decode msgpack to unit8Array
							const decodedTx = algosdk.decodeSignedTransaction(
								convertBase64ToUnit8Array(this.txInput)
							);
							this.txOutput = JSON.stringify(decodedTx, null, 4);
						} catch (error) {
							this.txInputError = error.message;
						}
					}
				}
			} else {
				// input is removed but preview still exists
				if (this.txOutput) {
					this.txOutput = "";
					this.txInputError = "";
				}
			}
		},
	},
	watch: {
		// update the preview and error whenever type and input is changed
		isMsgPackSelected() {
			this.handleInputPreviewChange();
		},
		txInput() {
			this.handleInputPreviewChange();
		},
	},
});
</script>
