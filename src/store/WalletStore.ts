import { defineStore } from "pinia";
import {
	WalletType,
	WalletStoreState,
	NetworkTypes,
	WebModeTypes,
} from "@/types";

export default defineStore("WalletStore", {
	state: (): WalletStoreState => {
		return {
			walletKind: WalletType.NONE,
			webMode: <WebModeTypes>{},
			address: "",
			network: NetworkTypes.NONE,
			algoExplorerURL: "", // to get transaction details
		};
	},
	getters: {
		getWebMode(state) {
			return state.webMode;
		},
	},
	actions: {
		setWalletType(walletType: WalletType) {
			this.walletKind = walletType;
		},
		setWebMode(webMode: WebModeTypes) {
			this.webMode = webMode;
			console.log("WebMode Initialized", webMode);
		},
		setWalletAddress(address: string) {
			this.address = address;
		},
		setNetworkTypes(network: NetworkTypes) {
			console.log("Network Changed: ", network);
			this.network = network;
			this.setAlgoExplorerUrl();
		},
		setAlgoExplorerUrl() {
			switch (this.network) {
				case NetworkTypes.MAIN_NET:
					this.algoExplorerURL =
						"https://algoindexer.algoexplorerapi.io/v2/transactions/";
					break;
				case NetworkTypes.TEST_NET:
					this.algoExplorerURL =
						"https://algoindexer.testnet.algoexplorerapi.io/v2/transactions/";
					break;
			}
		},
		addTxIDToUrl(txID: string) {
			return this.algoExplorerURL.concat(txID);
		},
	},
});
