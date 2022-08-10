import { formatTypes } from "@/types";

export const walletMessage = {
	NETWORK_ISSUE: (walletType: string) =>
		`Please select a network to connect with ${walletType}`,
};

export const MAIN_NET_URL = "https://node.algoexplorerapi.io";
export const TEST_NET_URL = "https://node.testnet.algoexplorerapi.io";
export const BETA_NET_URL = "https://node.betanet.algoexplorerapi.io";
export const ALGO_BUILDER_URL = "https://algobuilder.dev/";
export const tabList = [
	{
		key: formatTypes.JSON,
		tab: formatTypes.JSON,
	},
	{
		key: formatTypes.MSG_PACK,
		tab: formatTypes.MSG_PACK,
	},
];

export const Action = {
	DELETE: "Delete",
	EDIT: "Edit",
	SAVE: "Save",
	COPY: "Copy",
};
