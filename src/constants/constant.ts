export const GOV_TOKEN_ASSET = "gov-token";
export const VALIDATE_MESSAGES = {
	required: "required!",
	types: {
		url: "It is not a valid url!",
		number: "It is is not a valid number!",
	},
};

export const DAY_TO_MILLISECONDS = 1000 * 60 * 60 * 24;

export const MILLI_SECOND = 1000;

export const walletMessage = {
	NETWORK_ISSUE: (walletType: string) =>
		`Please select a network to connect with ${walletType}`,
};

export const MAIN_NET_URL = "https://node.algoexplorerapi.io";
export const TEST_NET_URL = "https://node.testnet.algoexplorerapi.io";
export const BETA_NET_URL = "https://node.betanet.algoexplorerapi.io";
