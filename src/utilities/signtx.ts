import WalletStore from "@/store/WalletStore";
import { MyAlgoWalletSession } from "@algo-builder/web";
import algosdk, { encodeObj } from "algosdk";
import { toRaw } from "vue";
import { convertBase64ToUnit8Array, convertToBase64 } from "./convert";

export async function signMultisigUsingMyAlgoWallet(txnBase64: string, txn: algosdk.Transaction) {
	const walletStore = WalletStore();
	const myAlgoMode = walletStore.webMode as MyAlgoWalletSession;
	const response = await toRaw(myAlgoMode).signTransaction(txn);
	const blob1 = convertBase64ToUnit8Array(txnBase64);
	const blob2 = response.blob;
	const initialSignedMsig = algosdk.decodeSignedTransaction(blob1).msig;
	// merging initial signed sk key to new signed txn object (returned from myAlgo wallet)
	const signedIndex = initialSignedMsig?.subsig.findIndex(
		(sig) => sig.s?.length
	);
	const myAlgoSignedTxn = algosdk.decodeSignedTransaction(blob2);
	if (typeof signedIndex === "number" && myAlgoSignedTxn.msig?.subsig.length) {
		myAlgoSignedTxn.msig.subsig[signedIndex].s =
			initialSignedMsig?.subsig[signedIndex].s;
	}
	const outputBase64 = convertToBase64(encodeObj(myAlgoSignedTxn));
	return { base64: outputBase64, json: myAlgoSignedTxn };
}

