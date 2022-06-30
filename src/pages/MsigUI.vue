<template>
	<a-layout-content class="content_sign">
		<a-row>
			<a-col :xs="{ span: 24 }" :lg="{ span: 10 }">
				<h1>Unsigned transaction</h1>
				<div class="sign_field">
					<a-textarea
						v-model:value="unsignedJson"
						placeholder="Base64 or JSON object"
						:rows="20"
						allow-clear
					/>
				</div>
				<span class="switch_button">
					<a-switch
						v-model:checked="inputBase64"
						checked-children="MSGPACK"
						un-checked-children="JSON"
					/>
				</span>
				<a-button type="primary" @click="sign">SIGN</a-button>
			</a-col>
			<a-col :xs="{ span: 24 }" :lg="{ span: 12, offset: 2 }">
				<h1>Signed transaction</h1>
				<a-card
					style="width: 100%"
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
					{{ contentList[key] }}
				</a-card>
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

export default defineComponent({
	name: "Multisignature UI",
	data() {
		const walletStore = WalletStore();

		const contentList: contentlist = {
			JSON: "JSON",
			MSG_PACK: "MSG_PACK(base64)",
		};

		const state = reactive({
			inputBase64: false,
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
			let TxnBase64: string;
			// let decode: {
			// 	txID: string,
			// 	blob: Uint8Array,
			// };
			// decode = {
			// 	txID = "",
			// }
			TxnBase64 = "";
			let signedTxn: JsonPayload;
			if (this.inputBase64) {
				TxnBase64 = this.unsignedJson;
			}
			switch (this.walletStore.walletKind) {
				case WalletType.MY_ALGO: {
					let signMyAlgo = this.walletStore.webMode as MyAlgoWalletSession;
					break;
				}
				case WalletType.ALGOSIGNER: {
					let signAlgoSigner = this.walletStore.webMode as WebMode;
					let JsonObject = algosdk.decodeObj(
						Buffer.from(TxnBase64, "base64")
					) as algosdk.EncodedSignedTransaction;
					let msig = algosdk.Transaction.from_obj_for_encoding(JsonObject.txn);
					const bytes = algosdk.encodeObj(msig.get_obj_for_encoding());
					console.log(
						"Base64 transaction: " + Buffer.from(bytes).toString("base64")
					);
					const TxnBase64Signing = Buffer.from(bytes).toString("base64"); // base64 of the transaction without signature
					const mparams = JsonObject.msig as algosdk.EncodedMultisig; //get information from subsig
					const version = mparams.v;
					const threshold = mparams.thr;
					const addr = mparams.subsig.map((x) => {
						console.log(x.pk);
						let address = algosdk.encodeAddress(x.pk) as string;
						return address;
					});

					console.log("version: " + version);
					console.log("threshold: " + threshold);
					console.log("address: " + addr);

					const multisigParams = {
						version: version,
						threshold: threshold,
						addrs: addr,
					};

					signedTxn = await signAlgoSigner.signTransaction([
						{
							txn: TxnBase64Signing,
							msig: multisigParams,
						},
					]);
					let json = signedTxn[0] as JsonPayload;
					let blob = json.blob as string;

					let blob1 = Uint8Array.from(Buffer.from(TxnBase64, "base64"));
					let blob2 = Uint8Array.from(Buffer.from(blob, "base64"));
					let combineBlob = algosdk.mergeMultisigTransactions([blob1, blob2]);
					console.log("New blob: " + combineBlob);

					let outputBase64 = Buffer.from(combineBlob).toString("base64");
					this.contentList.MSG_PACK = outputBase64;

					let newJson = algosdk.decodeSignedTransaction(
						Buffer.from(outputBase64, "base64")
					);
					this.contentList.JSON = JSON.stringify(newJson, null, 4);
					console.log(this.contentList.JSON);

					break;
				}
				case WalletType.WALLET_CONNECT: {
					let signWalletConnect = this.walletStore
						.webMode as WallectConnectSession;
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
