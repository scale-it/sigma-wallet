<template>
	<a-layout-content class="content_sign">
		<a-row>
			<a-col :xs="{ span: 24 }" :lg="{ span: 10 }">
				<h3>Unsigned transaction</h3>
				<div class="sign_field">
					<a-textarea
						v-model:value="unsignedInput"
						placeholder="Base64 msgpack"
						:rows="20"
						allow-clear
					>
					</a-textarea>
				</div>
				<div class="margin_top_med">
					<a-card title="Multisignature parameters">
						Addresses:
						<li v-for="li in addresses" :key="li.id" class="list_addresses">
							<span
								contenteditable="true"
								v-on:keydown.enter="updateAddress(li, $event)"
								v-on:blur="updateAddress(li, $event)"
							>
								{{ li.address }}
							</span>
							<a-button
								@click="removeAddress(li)"
								type="primary"
								danger
								shape="circle"
								size="small"
								>-</a-button
							>
						</li>

						<li class="list_addresses">
							<a-input v-model:value="newAddress" style="width: 90%"> </a-input>
							<a-button type="primary" shape="circle" @click="addAddress"
								>+</a-button
							>
						</li>
						<p class="margin_top_med">
							Threshold:
							<a-input
								type="number"
								placeholder="Threshold"
								v-model:value="threshold"
							/>
						</p>
						Version:
						<a-input
							type="number"
							placeholder="Version"
							v-model:value="version"
						/>
					</a-card>
				</div>
				<a-button type="primary" @click="sign" class="margin_top_med"
					>SIGN</a-button
				>
			</a-col>
			<a-col :xs="{ span: 24 }" :lg="{ span: 12, offset: 2 }">
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
import { contentlist, listAddresses, WalletType } from "@/types";
import { defineComponent, ref } from "vue";
import MultisigParameters from "@/components/multisigParameters.vue";
import {
	openErrorNotificationWithIcon,
	tabList,
	wrongAddress,
	wrongAddressDes,
} from "@/constants";
import {
	convertBase64ToUnit8Array,
	formatJSON,
	prettifyTransaction,
} from "@/utilities";
import { WebMode, WallectConnectSession } from "@algo-builder/web";
import { JsonPayload } from "@algo-builder/web/build/algo-signer-types";
import algosdk from "algosdk";
import WalletStore from "@/store/WalletStore";

let id = 0;

export default defineComponent({
	name: "Init multisignature transaction UI",
	components: {
		MultisigParameters,
	},
	data() {
		const addresses: listAddresses[] = [];
		const contentList: contentlist = {
			JSON: "JSON",
			MSG_PACK: "MSG_PACK(base64)",
		};

		const walletStore = WalletStore();

		const key = ref("tab1");

		const onTabChange = (value: string, type: string) => {
			console.log(value, type);
			if (type === "key") {
				key.value = value;
			}
		};

		return {
			unsignedInput: "",
			addresses,
			newAddress: "",
			version: 0,
			threshold: 0,
			key,
			onTabChange,
			tabList,
			contentList,
			walletStore,
		};
	},
	methods: {
		addAddress() {
			this.addresses.push({
				id: id++,
				address: this.newAddress,
			});
			this.newAddress = "";
		},
		removeAddress(address: listAddresses) {
			this.addresses = this.addresses.filter((t) => t !== address);
		},
		updateAddress(address: listAddresses, event: any) {
			event.preventDefault();
			address.address = event.target.innerText;
			event.target.blur();
		},
		async sign() {
			let txnBase64 = "";
			txnBase64 = this.unsignedInput;

			switch (this.walletStore.walletKind) {
				case WalletType.MY_ALGO: {
					break;
				}
				case WalletType.ALGOSIGNER: {
					let signAlgoSigner = this.walletStore.webMode as WebMode;

					let sender = algosdk.decodeUnsignedTransaction(
						convertBase64ToUnit8Array(txnBase64)
					);
					let fromAddr = algosdk.encodeAddress(sender.from.publicKey);
					let addr = this.addresses.map((x) => {
						return x.address;
					});

					let version = this.version * 1;
					let threshold = this.threshold * 1;

					const multisigParams = {
						version: version,
						threshold: threshold,
						addrs: addr,
					};
					let multisigaddr = algosdk.multisigAddress(multisigParams);
					if (fromAddr != multisigaddr) {
						openErrorNotificationWithIcon(wrongAddress, wrongAddressDes);
						break;
					}
					let signedTxn = await signAlgoSigner.signTransaction([
						{
							txn: txnBase64,
							msig: multisigParams,
						},
					]);
					const json = signedTxn[0] as JsonPayload;
					this.contentList.MSG_PACK = json.blob as string;
					const arr = convertBase64ToUnit8Array(this.contentList.MSG_PACK);
					const newJson = algosdk.decodeSignedTransaction(arr);
					this.contentList.JSON = formatJSON(prettifyTransaction(newJson));
					break;
				}
				case WalletType.WALLET_CONNECT: {
					let signWalletConnect = this.walletStore
						.webMode as WallectConnectSession;

					let trxs = algosdk.decodeUnsignedTransaction(
						convertBase64ToUnit8Array(txnBase64)
					);
					let signedJson = await signWalletConnect.signTransactionGroup([
						{
							txn: trxs,
							shouldSign: true,
						},
					]);

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
