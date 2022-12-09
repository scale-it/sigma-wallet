export enum WalletType {
	NONE,
	ALGOSIGNER = "AlgoSigner",
	MY_ALGO = "My Algo Connect",
	WALLET_CONNECT = "Wallet Connect",
}

export enum NetworkTypes {
	NONE = "",
	MAIN_NET = "MainNet",
	TEST_NET = "TestNet",
	BETA_NET = "BetaNet",
	PRIVATE_NET = "PrivateNet", // only for testing, to be removed, Wallet connect and MyAlgo wallet doesn't support it
}

export enum formatTypes {
	JSON = "JSON",
	MSG_PACK = "MSG_PACK",
}

export enum Tabs {
	Msig,
	TxSender,
	InitMsig,
}

export enum EndPoint {
	HOME_PAGE = "/",
	CREATE_TXN = "/create-txn",
}
