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
						@change="(event) => MultiParams(event.target.value, mparamsPartial)"
					>
					</a-textarea>
				</div>
				<a-button type="primary" @click="sign">SIGN</a-button>
				<a-card title="Multisignature parameters" style="margin-top: 14px">
					Addresses:
					<li
						v-for="ADDRESSES in mparamsPartial.addresses"
						:key="ADDRESSES.address"
						style="word-wrap: break-word; font-size: 90%"
					>
						<CheckCircleTwoTone
							v-if="ADDRESSES.signed"
							twoToneColor="#52c41a"
						/>
						<CloseCircleTwoTone twoToneColor="#f5222d" v-else />
						{{ ADDRESSES.address }}
					</li>
					<p style="margin-top: 10px">
						Threshold: {{ mparamsPartial.threshold }}/{{
							mparamsPartial.addresses.length
						}}
					</p>
					<p>Version: {{ mparamsPartial.version }}</p>
				</a-card>
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
				<a-card title="Multisignature parameters" style="margin-top: 14px" v-if="signed">
					Addresses:
					<li
						v-for="ADDRESSES in mparamsSigned.addresses"
						:key="ADDRESSES.address"
						style="word-wrap: break-word; font-size: 90%"
					>
						<CheckCircleTwoTone
							v-if="ADDRESSES.signed"
							twoToneColor="#52c41a"
						/>
						<CloseCircleTwoTone twoToneColor="#f5222d" v-else />
						{{ ADDRESSES.address }}
					</li>
					<p style="margin-top: 10px">
						Threshold: {{ mparamsSigned.threshold }}/{{
							mparamsSigned.addresses.length
						}}
					</p>
					<p>Version: {{ mparamsSigned.version }}</p>
				</a-card>
			</a-col>
		</a-row>
	</a-layout-content>
</template>

<script lang="ts">
import WalletStore from "@/store/WalletStore";
import algosdk, { Transaction } from "algosdk";
import { CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons-vue";
import { defineComponent, reactive, toRefs, ref } from "vue";
import {
	MyAlgoWalletSession,
	WallectConnectSession,
	WebMode,
} from "@algo-builder/web";
import { WalletType, contentlist, MultisignatureParam } from "@/types";
import { tabList } from "@/constants";
import { JsonPayload } from "@algo-builder/web/build/algo-signer-types";

export default defineComponent({
	name: "Multisignature UI",
	components: {
		CheckCircleTwoTone,
		CloseCircleTwoTone,
	},
	data() {
		const walletStore = WalletStore();

		const contentList: contentlist = {
			JSON: "JSON",
			MSG_PACK: "MSG_PACK(base64)",
		};

		const mparamsPartial: MultisignatureParam = {
			addresses: [],
			version: 0,
			threshold: 0,
		};

		const mparamsSigned: MultisignatureParam = {
			addresses: [],
			version: 0,
			threshold: 0,
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
			mparamsPartial,
			mparamsSigned,
		};
	},
	methods: {
		async sign() {
			let TxnBase64: string;
			TxnBase64 = "";
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

					let newJson = algosdk.decodeSignedTransaction(Buffer.from(outputBase64, "base64"));
					this.contentList.JSON = JSON.stringify(newJson, null, 4);
					this.MultiParams(outputBase64, this.mparamsSigned);
					this.signed = true;
					break;
				}
				case WalletType.WALLET_CONNECT: {
					let signWalletConnect = this.walletStore
						.webMode as WallectConnectSession;

					let Trxs = algosdk.decodeUnsignedTransaction(
						Buffer.from(TxnBase64, "base64")
					);
					console.log(Trxs);
					let signedJson = await signWalletConnect.signTransactionGroup([
						{
							txn: Trxs,
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
		MultiParams(input: string, multiParams: MultisignatureParam) {
			let JsonObject = algosdk.decodeObj(
				Buffer.from(input, "base64")
			) as algosdk.EncodedSignedTransaction;
			const mparams = JsonObject.msig as algosdk.EncodedMultisig; //get information from subsig
			multiParams.threshold = mparams.thr;
			multiParams.version = mparams.v;
			multiParams.addresses = mparams.subsig.map((x) => {
				let address = algosdk.encodeAddress(x.pk) as string;
				let signed = true;
				if (x.s == null) {
					signed = false;
				}
				return {
					address,
					signed,
				};
			});
		},
	},
});
</script>
