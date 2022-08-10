<template>
	<a-layout-content class="content_sign">
		<a-row>
			<a-col :xs="{ span: 24 }" :lg="{ span: 11 }">
				<h3>Partial sign transaction</h3>
				<div class="sign_field">
					<a-textarea
						v-model:value="unsignedJson"
						placeholder="Base64 msgpack"
						:rows="20"
						allow-clear
					>
					</a-textarea>
				</div>
				<a-button type="primary" @click="sign">SIGN</a-button>
				<MultisigParameters :inputBase64="unsignedJson" />
			</a-col>
			<a-col :xs="{ span: 24 }" :lg="{ span: 11, offset: 2 }">
				<h3>Transaction preview</h3>
				<a-card
					class="card"
					title="Format Transaction"
					:tab-list="tabList"
					:active-tab-key="key"
					:bordered="false"
					@tabChange="(key) => onTabChange(key, 'key')"
				>
					<template #customTab="item">
						<span>
							{{ item.key }}
						</span>
					</template>
					<a-textarea
						class="text_area"
						:auto-size="{ maxRows: 22 }"
						:bordered="false"
						v-model:value="contentList[key]"
						:disabled="true"
					/>
				</a-card>
				<MultisigParameters :inputBase64="contentList.MSG_PACK" />
			</a-col>
		</a-row>
	</a-layout-content>
</template>

<script lang="ts">
import WalletStore from "@/store/WalletStore";
import algosdk, { Transaction } from "algosdk";
import { defineComponent, reactive, toRefs, ref, shallowRef } from "vue";
import {
	MyAlgoWalletSession,
	WallectConnectSession,
	WebMode,
} from "@algo-builder/web";
import { WalletType, contentlist } from "@/types";
import {
	errorMessage,
	NOT_SUPPORT_WALLET,
	NO_WALLET,
	openErrorNotificationWithIcon,
	openSuccessNotificationWithIcon,
	SIGN_SUCCESSFUL,
	tabList,
} from "@/constants";
import { JsonPayload } from "@algo-builder/web/build/algo-signer-types";
import MultisigParameters from "@/components/multisigParameters.vue";
import {
	convertBase64ToUnit8Array,
	formatJSON,
	prettifyTransaction,
	convertToBase64,
} from "@/utilities";

export default defineComponent({
	name: "Multisignature UI",
	components: {
		MultisigParameters,
	},
	data() {
		const walletStore = WalletStore();

		const contentList: contentlist = {
			JSON: "JSON",
			MSG_PACK: "MSG_PACK(base64)",
		};

		const state = reactive({
			signed: false,
		});

		const key = ref("tab1");

		const onTabChange = (value: string, type: string) => {
			if (type === "key") {
				key.value = value;
			}
		};

		return {
			unsignedJson: "",
			signedJson: "",
			buttonClass: "btn btn-danger",
			formControl: "form-control",
			walletStore,
			Transaction,
			tabList,
			contentList,
			...toRefs(state),
			key,
			onTabChange,
		};
	},
	methods: {
		displayError(error: Error) {
			errorMessage(this.key);
			openErrorNotificationWithIcon(error.message);
		},
		async sign() {
			let txnBase64 = "";
			let signedTxn: JsonPayload;
			txnBase64 = this.unsignedJson;

			try {
				switch (this.walletStore.walletKind) {
					case WalletType.MY_ALGO: {
						openErrorNotificationWithIcon(NOT_SUPPORT_WALLET);
						break;
					}
					case WalletType.ALGOSIGNER: {
						let signAlgoSigner = this.walletStore.webMode as WebMode;
						let jsonObject = algosdk.decodeObj(
							convertBase64ToUnit8Array(txnBase64)
						) as algosdk.EncodedSignedTransaction;
						if (jsonObject.txn === undefined) {
							openErrorNotificationWithIcon(
								"Input transaction must be multisigature transaction signed at least 1 signature"
							);
							break;
						}
						let msig = algosdk.Transaction.from_obj_for_encoding(
							jsonObject.txn
						);
						const bytes = algosdk.encodeObj(msig.get_obj_for_encoding());
						const txnBase64Signing = convertToBase64(bytes); // base64 of the transaction without signature
						const mparams = jsonObject.msig as algosdk.EncodedMultisig; // get information from subsig

						const version = mparams.v;
						const threshold = mparams.thr;
						const addr = mparams.subsig.map((signData) => {
							let address = algosdk.encodeAddress(signData.pk) as string;
							return address;
						});

						const multisigParams = {
							version: version,
							threshold: threshold,
							addrs: addr,
						};

						signedTxn = await signAlgoSigner.signTransaction([
							{
								txn: txnBase64Signing,
								msig: multisigParams,
							},
						]);
						const json = signedTxn[0] as JsonPayload;
						const blob = json.blob as string;

						const blob1 = convertBase64ToUnit8Array(txnBase64);
						const blob2 = convertBase64ToUnit8Array(blob);
						const combineBlob = algosdk.mergeMultisigTransactions([
							blob1,
							blob2,
						]);

						const outputBase64 = convertToBase64(combineBlob);
						this.contentList.MSG_PACK = outputBase64;

						const newJson = algosdk.decodeSignedTransaction(combineBlob);
						this.contentList.JSON = formatJSON(prettifyTransaction(newJson));
						this.signed = true;
						this.key = "JSON";
						openSuccessNotificationWithIcon(SIGN_SUCCESSFUL);
						break;
					}
					case WalletType.WALLET_CONNECT: {
						openErrorNotificationWithIcon(NOT_SUPPORT_WALLET);
						break;
					}
					default: {
						openErrorNotificationWithIcon(NO_WALLET);
						break;
					}
				}
			} catch (error) {
				this.displayError(error);
				console.log(error);
			}
		},
	},
});
</script>
