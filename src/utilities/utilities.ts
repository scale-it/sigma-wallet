import { port, server, token } from "@/config/algob.config";
import { AlgoExplorerIndexerURL } from "@/constants";
import WalletStore from "@/store/WalletStore";
import { EndPoint, NetworkTypes } from "@/types";
import algosdk from "algosdk";
import IndexerClient from "algosdk/dist/types/src/client/v2/indexer/indexer";
import { Router } from "vue-router";

/**
 * Method to redirect user
 * @param router reference to router object
 * @param path path where user has to be redirected
 */
export const redirectTo = (router: Router, path: EndPoint) => {
	router.push({ path: path });
};


export const indexerClient = (): IndexerClient => {
	const walletStore = WalletStore()
	const network = walletStore.network
	let indexer_token: any = ""
	let indexer_port: string | number = ""
	let indexer_server = ""
	switch (network) {
		case NetworkTypes.MAIN_NET:
			indexer_server = AlgoExplorerIndexerURL.MAIN_NET_URL
			break
		case NetworkTypes.TEST_NET:
			indexer_server = AlgoExplorerIndexerURL.TEST_NET_URL
			break
		case NetworkTypes.BETA_NET:
			indexer_server = AlgoExplorerIndexerURL.BETA_NET_URL
			break
		case NetworkTypes.PRIVATE_NET:
			indexer_token = token
			indexer_port = port
			indexer_server = server
			break
	}
	return new algosdk.Indexer(indexer_token, indexer_server, indexer_port);
}