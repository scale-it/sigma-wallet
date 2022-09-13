<template>
	<a-layout-content class="content_sign">
		<a-row>
			<a-col :xs="{ span: 24 }" :lg="{ span: 11 }">
				<h3>Unsigned transaction</h3>
				<p>
					Specify your multisignature transaction parameters: addresses,
					threshold, version, along with providing the
					<a
						href="https://algorand.github.io/js-algorand-sdk/classes/Transaction.html"
						target="_blank"
						>algosdk.Transaction</a
					>
					in base64 Msgpack.
				</p>
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
						<a-list size="small" :data-source="addresses">
							<template #renderItem="{ item }">
								<a-list-item>
									<a-textarea
										v-if="item.edit"
										v-model:value="item.address"
										v-on:keydown.enter="item.edit = !item.edit"
										auto-Size
									/>
									<div v-else class="list_addresses">
										{{ item.address }}
									</div>
									<template #actions>
										<a-button
											@click="item.edit = !item.edit"
											type="link"
											shape="circle"
											size="small"
											ghost
											><div v-if="!item.edit">
												<IconWithToolTip :data="'Edit'" :icon="'Edit'" />
											</div>
											<div v-else>
												<IconWithToolTip :data="'Save'" :icon="'Save'" />
											</div>
										</a-button>
										<a-button
											@click="removeAddress(item)"
											type="link"
											danger
											shape="circle"
											size="small"
											ghost
										>
											<IconWithToolTip :data="'Delete'" :icon="'Delete'" />
										</a-button>
									</template>
								</a-list-item>
							</template>
						</a-list>

						<li class="list_addresses">
							<a-input-search
								v-model:value="newAddress"
								placeholder="Add address"
								enter-button="+"
								@search="addAddress"
							/>
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
			<a-col :xs="{ span: 24 }" :lg="{ span: 11, offset: 2 }">
				<h3>Transaction preview</h3>
				<p>
					This is the preview of a new multisigature transaction created using
					the parameters you provided in left column. You can sign it in the
					<a @click="propsHomeTabChange(Tabs.Msig)">MultiSig</a> Tab.
				</p>
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
import { contentlist, listAddresses, WalletType, Tabs } from "@/types";
import { defineComponent, ref } from "vue";
import MultisigParameters from "@/components/multisigParameters.vue";
import {
	errorMessage,
	openErrorNotificationWithIcon,
	tabList,
	WRONG_ADDRESS,
	WRONG_ADDRESSES,
	NO_WALLET,
	NOT_SUPPORT_WALLET,
	openSuccessNotificationWithIcon,
	SIGN_SUCCESSFUL,
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
import IconWithToolTip from "@/components/IconToolTip/IconWithToolTip.vue";

let id = 0;

export default defineComponent({
	name: "MsigTx Creator",
	components: {
		MultisigParameters,
		IconWithToolTip,
	},
	props: {
		onHomeTabChange: Function,
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
			Tabs,
		};
	},
	methods: {
		propsHomeTabChange(value: Tabs) {
			typeof this.onHomeTabChange === "function" && this.onHomeTabChange(value);
		},
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
		displayError(error: Error) {
			errorMessage(this.key);
			openErrorNotificationWithIcon(error.message);
		},
		async sign() {
			let txnBase64 = "";
			txnBase64 = this.unsignedInput;
			try {
				switch (this.walletStore.walletKind) {
					case WalletType.MY_ALGO: {
						openErrorNotificationWithIcon(NOT_SUPPORT_WALLET);
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
							openErrorNotificationWithIcon(WRONG_ADDRESS, WRONG_ADDRESSES);
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
						openSuccessNotificationWithIcon(SIGN_SUCCESSFUL);
						this.key = "JSON";
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
			}
		},
	},
});
</script>
