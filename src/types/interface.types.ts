import { NetworkTypes, WebModeTypes, WalletType } from "@/types";

export interface WalletStoreState {
	walletKind: WalletType;
	webMode: WebModeTypes;
	address: string;
	network: NetworkTypes;
	algoExplorerURL: string;
}
