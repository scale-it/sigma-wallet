<template>
	<a-layout-content class="content_sign">
		<a-row>
			<a-col :xs="{ span: 24 }" :lg="{ span: 10 }">
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
			<a-col :xs="{ span: 24 }" :lg="{ span: 12, offset: 2 }">
				<h3>Signed transaction</h3>
				<a-card
					style="width: 100%; word-wrap: break-word"
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
						style="background-color: white !important; color: black !important"
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
import { defineComponent, reactive, toRefs, ref } from "vue";
import {
	MyAlgoWalletSession,
	WallectConnectSession,
	WebMode,
} from "@algo-builder/web";
import { WalletType, contentlist } from "@/types";
import { tabList } from "@/constants";
import { JsonPayload } from "@algo-builder/web/build/algo-signer-types";
import MultisigParameters from "@/components/multisigParameters.vue";

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
			console.log(value, type);
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
		async sign() {
			let TxnBase64 = "";
			let signedTxn: JsonPayload;
			TxnBase64 = this.unsignedJson;
			switch (this.walletStore.walletKind) {
				case WalletType.MY_ALGO: {
					let signMyAlgo = this.walletStore.webMode as MyAlgoWalletSession;

					let Trxs = algosdk.decodeUnsignedTransaction(
						Buffer.from(TxnBase64, "base64")
					);
					let tmpSign = await signMyAlgo.signTransaction(Trxs);
					console.log(tmpSign);

					break;
				}
				case WalletType.ALGOSIGNER: {
					let signAlgoSigner = this.walletStore.webMode as WebMode;
					let jsonObject = algosdk.decodeObj(
						Buffer.from(TxnBase64, "base64")
					) as algosdk.EncodedSignedTransaction;
					let msig = algosdk.Transaction.from_obj_for_encoding(jsonObject.txn);
					const bytes = algosdk.encodeObj(msig.get_obj_for_encoding());
					console.log(
						"Base64 transaction: " + Buffer.from(bytes).toString("base64")
					);
					const txnBase64Signing = Buffer.from(bytes).toString("base64"); // base64 of the transaction without signature
					const mparams = jsonObject.msig as algosdk.EncodedMultisig; //get information from subsig
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

					const blob1 = Uint8Array.from(Buffer.from(TxnBase64, "base64"));
					const blob2 = Uint8Array.from(Buffer.from(blob, "base64"));
					const combineBlob = algosdk.mergeMultisigTransactions([blob1, blob2]);

					const outputBase64 = Buffer.from(combineBlob).toString("base64");
					this.contentList.MSG_PACK = outputBase64;

					const newJson = algosdk.decodeSignedTransaction(
						Buffer.from(outputBase64, "base64")
					);
					this.contentList.JSON = JSON.stringify(newJson, null, 4);
					this.signed = true;
					break;
				}
				case WalletType.WALLET_CONNECT: {
					let signWalletConnect = this.walletStore
						.webMode as WallectConnectSession;

					let trxs = algosdk.decodeUnsignedTransaction(
						Buffer.from(TxnBase64, "base64")
					);
					console.log(trxs);
					let signedJson = await signWalletConnect.signTransactionGroup([
						{
							txn: trxs,
							shouldSign: true,
						},
					]);
					console.log(signedJson);

					break;
				}
				default: {
					console.log("Invalid wallet type connected");
					break;
				}
			}
		},
	},
});
</script>
