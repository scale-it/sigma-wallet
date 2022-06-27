<template>
	<a-layout-content class="content_sign">
		<a-row>
			<a-col :span="10">
				<h1>Unsigned transaction</h1>
				<a-switch
					v-model:checked="inputBase64"
					checked-children="MSGPACK"
					un-checked-children="JSON"
				/>
				<div class="sign_field">
					<a-textarea
						v-model:value="unsignedJson"
						placeholder="Base64 or JSON object"
						:rows="20"
						allow-clear
					/>
				</div>
				<a-button type="primary" @click="sign">SIGN</a-button>
			</a-col>
			<a-col :span="12" :offset="2">
				<h1>Signed transaction</h1>
				<a-card
					style="width: 100%"
					title="Format Transaction"
					:tab-list="tabList"
					:active-tab-key="key"
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
import { WalletType } from "@/types";
import { tabList } from "@/constants";

export default defineComponent({
	name: "Multisignature UI",
	data() {
		const walletStore = WalletStore();

		const contentList = {
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
		sign() {
			switch (this.walletStore.walletKind) {
				case WalletType.MY_ALGO: {
					let signMyAlgo = this.walletStore.webMode as MyAlgoWalletSession;
					break;
				}
				case WalletType.ALGOSIGNER: {
					let signAlgoSigner = this.walletStore.webMode as WebMode;
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
