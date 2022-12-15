<template>
	<a-layout-content class="content_sign">
		<ErrorBlock :error="error" :update-error="(val:string) => (error = val)" />
		<a-row>
			<a-col :xs="{ span: 24 }" :lg="{ span: 11 }">
				<h3>Unsigned transaction</h3>
				<p>
					Specify your multisignature transaction parameters: addresses,
					threshold, version, along with providing the
					<router-link :to="{ path: EndPoint.CREATE_TXN }">
						Transaction</router-link
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
				<div class="margin_top_med">
					<a-button type="primary" @click="handleCreateTxn">Create</a-button>
					<a-button
						type="primary"
						@click="sign"
						:loading="btnLoader"
						class="margin_left_med"
						>Create And Sign</a-button
					>
				</div>
			</a-col>
			<a-col :xs="{ span: 24 }" :lg="{ span: 11, offset: 2 }">
				<h3>Transaction preview</h3>
				<p>
					This is the preview of a new multisigature Signed Encoded Transaction
					created using the parameters you provided in left column. You can sign
					it using
					<a @click="propsHomeTabChange(Tabs.Msig)">MultiSig</a> Tab, and send
					it to blockchain using
					<a @click="propsHomeTabChange(Tabs.TxSender)">TxSender</a> Tab,
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
import {
	contentlist,
	listAddresses,
	WalletType,
	Tabs,
	EndPoint,
} from "@/types";
import { defineComponent, ref } from "vue";
import MultisigParameters from "@/components/multisigParameters.vue";
import {
	errorMessage,
	openErrorNotificationWithIcon,
	tabList,
	NO_WALLET,
	WALLET_NOT_SUPPORTED,
	openSuccessNotificationWithIcon,
	SIGN_SUCCESSFUL,
	TXN_CREATED_SUCCESSFUL,
	ERROR_TITLE,
} from "@/constants";
import {
	assertAddrPartOfMultisig,
	convertBase64ToUint8Array,
	convertToBase64,
	formatJSON,
	prettifyTransaction,
	signMultisigUsingAlgosigner,
	signMultisigUsingMyAlgoWallet,
} from "@/utilities";
import algosdk, { decodeAddress, encodeObj } from "algosdk";
import WalletStore from "@/store/WalletStore";
import IconWithToolTip from "@/components/IconToolTip/IconWithToolTip.vue";
import ErrorBlock from "@/components/ErrorBlock.vue";

export default defineComponent({
	name: "MsigTx Creator",
	components: {
		MultisigParameters,
		IconWithToolTip,
		ErrorBlock,
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
			version: 1,
			threshold: 1,
			key,
			onTabChange,
			tabList,
			contentList,
			walletStore,
			Tabs,
			createTxn: false,
			createdMsigTxnBase64: "",
			id: 0,
			EndPoint,
			error: "",
			btnLoader: false,
		};
	},
	methods: {
		handleCreateTxn() {
			this.createTxn = true;
			this.createMultisig();
		},
		propsHomeTabChange(value: Tabs) {
			typeof this.onHomeTabChange === "function" && this.onHomeTabChange(value);
		},
		addAddress() {
			try {
				// check if address is a valid one
				if (!this.newAddress.length || !decodeAddress(this.newAddress)) {
					throw new Error("Please enter a valid address.");
				}
				// check if the new address is already added
				if (
					this.addresses.findIndex(
						(item: { address: string; id: number }) =>
							item.address === this.newAddress
					) !== -1
				) {
					throw new Error("Address already exists.");
				}
				this.addresses.push({
					id: this.id++,
					address: this.newAddress,
				});
				this.newAddress = "";
			} catch (error) {
				this.displayError(error);
			}
		},
		removeAddress(address: listAddresses) {
			this.addresses = this.addresses.filter((t) => t !== address);
		},
		displayError(error: Error) {
			errorMessage(this.key);
			openErrorNotificationWithIcon(ERROR_TITLE);
			this.error = error.message;
		},
		createMultisig() {
			try {
				let txn = algosdk.decodeUnsignedTransaction(
					convertBase64ToUint8Array(this.unsignedInput)
				);
				let addr = this.addresses.map((x) => {
					return x.address;
				});

				if (!addr.length) {
					throw new Error("Please add your addresses to create a msig addr.");
				}
				if (this.addresses.length <= 1) {
					throw new Error(
						"Please add more address to form your multisig address."
					);
				}

				let version = +this.version;
				let threshold = +this.threshold;

				const multisigParams = {
					version: version,
					threshold: threshold,
					addrs: addr,
				};
				let multisigaddr = algosdk.multisigAddress(multisigParams);
				// user want to update the from addr with the msig addr
				txn.from = decodeAddress(multisigaddr);
				let subsig = [];
				for (const address of addr) {
					subsig.push({ pk: decodeAddress(address).publicKey });
				}
				const msigTxn = {
					msig: { v: version, thr: threshold, subsig: subsig },
					txn: txn.get_obj_for_encoding(),
				};
				const base64 = convertToBase64(encodeObj(msigTxn));
				// display created msig txn in output preview (if create txn is clicked)
				if (this.createTxn) {
					this.contentList.MSG_PACK = base64;
					this.contentList.JSON = formatJSON(prettifyTransaction(msigTxn));
					this.key = "MSG_PACK";
					openSuccessNotificationWithIcon(TXN_CREATED_SUCCESSFUL);
				}
				this.createdMsigTxnBase64 = base64;
				return multisigParams;
			} catch (error) {
				this.displayError(error);
			}
		},
		async sign() {
			this.createTxn = false;
			try {
				if (this.walletStore.walletKind) {
					this.btnLoader = true;
					await assertAddrPartOfMultisig(
						this.addresses,
						this.walletStore.address
					);
					this.btnLoader = false;
					const multisigParams = this.createMultisig();
					let txnBase64 = "";
					txnBase64 = this.createdMsigTxnBase64;
					switch (this.walletStore.walletKind) {
						case WalletType.MY_ALGO: {
							let jsonObject = algosdk.decodeObj(
								convertBase64ToUint8Array(txnBase64)
							) as algosdk.SignedTransaction;
							const { base64, json } = await signMultisigUsingMyAlgoWallet(
								txnBase64,
								jsonObject.txn
							);
							this.contentList.MSG_PACK = base64;
							this.contentList.JSON = formatJSON(prettifyTransaction(json));
							this.key = "MSG_PACK";
							openSuccessNotificationWithIcon(SIGN_SUCCESSFUL);
							break;
						}
						case WalletType.ALGOSIGNER: {
							if (!multisigParams) {
								return;
							}
							const { base64, json } = await signMultisigUsingAlgosigner(
								txnBase64
							);
							this.contentList.MSG_PACK = base64;
							this.contentList.JSON = formatJSON(prettifyTransaction(json));
							this.key = "MSG_PACK";
							openSuccessNotificationWithIcon(SIGN_SUCCESSFUL);
							break;
						}
						case WalletType.WALLET_CONNECT: {
							openErrorNotificationWithIcon(WALLET_NOT_SUPPORTED);
							break;
						}
						default: {
							openErrorNotificationWithIcon(NO_WALLET);
							break;
						}
					}
				} else throw Error(NO_WALLET);
			} catch (error) {
				this.btnLoader = false;
				this.displayError(error);
			}
		},
	},
});
</script>
