<template>
	<a-layout-content class="content_sign">
		<a-row>
			<a-col :xs="{ span: 24 }" :lg="{ span: 10 }">
				<h2>Transaction Input</h2>
				<p>
					Here you can add your transaction in base64 Msgpack format which you
					want to send to the network.
				</p>
				<a-textarea
					placeholder="Base64 msgpack"
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
				<h2>Transaction preview</h2>
				<p>This is the preview of your signed transaction in JSON format.</p>
				<a-textarea
					class="text_area"
					:style="txOutput.length"
					:auto-size="{ maxRows: 22 }"
					:bordered="false"
					v-model:value="txOutput"
					:disabled="true"
				/>
				<a-button
					class="margin_top_med"
					type="primary"
					@click="openConfirmationModal"
					:disabled="!txOutput || isSendDisabled"
					>Send</a-button
				>
			</a-col>
		</a-row>
		<a-row v-if="confirmedResponse" class="margin_top_med">
			<div>
				<h2>Transaction Receipt</h2>
				<p>
					This is the confirmed response of your signed transaction sent to the
					network.
				</p>
				<div>
					<a class="med_font_size" :href="algoExplorerURl" target="_blank"
						>Open in Algo Explorer</a
					>
				</div>
			</div>
			<a-textarea
				class="text_area"
				:auto-size="{ maxRows: 22 }"
				:bordered="false"
				v-model:value="confirmedResponse"
				:disabled="true"
			/>
		</a-row>
	</a-layout-content>
</template>

<script lang="ts">
import { defineComponent, createVNode } from "vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";
import WalletStore from "@/store/WalletStore";
import {
	convertBase64ToUnit8Array,
	formatJSON,
	prettifyTransaction,
} from "@/utilities";
import algosdk, { decodeObj, EncodedSignedTransaction } from "algosdk";
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
			txInput: undefined,
			txOutput: "",
			txInputError: "",
			key: "SenderKey",
			confirmedResponse: "",
			isSendDisabled: false,
		};
	},
	setup() {
		const walletStore = WalletStore();
		return {
			walletStore,
			algoExplorerURl: walletStore.algoExplorerURL,
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
			// for MyAlgo wallet and Wallet Connect the transaction is not formatted like in Algosigner
			if (this.walletStore.walletKind === WalletType.ALGOSIGNER) {
				this.confirmedResponse = formatJSON(response);
			} else {
				let formattedJSON: any = response;
				formattedJSON.txn = prettifyTransaction(response.txn);
				this.confirmedResponse = formatJSON(formattedJSON);
			}
			this.isSendDisabled = true;
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
			// algosigner accepts base64 not uint8Array
			if (this.walletStore.walletKind === WalletType.ALGOSIGNER) {
				encodedTx = this.txInput as string;
			} else {
				encodedTx = convertBase64ToUnit8Array(this.txInput);
			}
			const decodedTxn = decodeObj(
				convertBase64ToUnit8Array(this.txInput)
			) as EncodedSignedTransaction;

			const txID = algosdk.Transaction.from_obj_for_encoding(
				decodedTxn.txn
			).txID();
			this.algoExplorerURl = this.walletStore.addTxIDToUrl(txID);
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
				// msgpack is selected
				this.txInputError = "";
				try {
					// decode msgpack to unit8Array
					const decodedTx = algosdk.decodeSignedTransaction(
						convertBase64ToUnit8Array(this.txInput)
					);
					this.txOutput = formatJSON(prettifyTransaction(decodedTx));
				} catch (error) {
					this.txInputError = error.message;
				}
				if (this.isSendDisabled && this.txOutput) {
					this.isSendDisabled = false;
				}
			} else {
				// input is removed but preview still exists
				if (this.txOutput) {
					this.txOutput = "";
				}
				this.txInputError = "";
			}
		},
	},
	watch: {
		// update the preview and error whenever type and input is changed
		txInput() {
			this.handleInputPreviewChange();
		},
	},
});
</script>
