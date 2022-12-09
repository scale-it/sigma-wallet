import WalletStore from "@/store/WalletStore";
import { MyAlgoWalletSession, WebMode } from "@algo-builder/web";
import algosdk, {
	EncodedSignedTransaction,
	EncodedTransaction,
	encodeObj,
	Transaction,
} from "algosdk";
import { toRaw } from "vue";
import { convertBase64ToUint8Array, convertToBase64 } from "./convert";

export async function signMultisigUsingMyAlgoWallet(
	txnBase64: string,
	txn: algosdk.Transaction | EncodedTransaction
) {
	try {
		const walletStore = WalletStore();
		const myAlgoMode = walletStore.webMode as MyAlgoWalletSession;
		if ((txn as EncodedTransaction).rcv) {
			txn = algosdk.Transaction.from_obj_for_encoding(
				txn as EncodedTransaction
			);
		}
		const response = await toRaw(myAlgoMode).signTransaction(
			txn as Transaction
		);
		const blob1 = convertBase64ToUint8Array(txnBase64);
		const blob2 = response.blob;
		const initialSignedMsig = algosdk.decodeSignedTransaction(blob1).msig;
		// merging initial signed sk key to new signed txn object (returned from myAlgo wallet)
		const signedIndex = initialSignedMsig?.subsig.findIndex(
			(sig) => sig.s?.length
		);
		const myAlgoSignedTxn = algosdk.decodeSignedTransaction(blob2);
		const encodedTxn = {
			...myAlgoSignedTxn,
			txn: myAlgoSignedTxn.txn.get_obj_for_encoding(),
		} as EncodedSignedTransaction;

		if (typeof signedIndex === "number" && encodedTxn.msig?.subsig.length) {
			encodedTxn.msig.subsig[signedIndex].s =
				initialSignedMsig?.subsig[signedIndex].s;
		}
		const outputBase64 = convertToBase64(encodeObj(encodedTxn));
		return { base64: outputBase64, json: encodedTxn };
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function signMultisigUsingAlgosigner(txnBase64: string) {
	try {
		const walletStore = WalletStore();
		const signAlgoSigner = walletStore.webMode as WebMode;
		const jsonObject = algosdk.decodeObj(
			convertBase64ToUint8Array(txnBase64)
		) as algosdk.EncodedSignedTransaction;
		const signedTxn = await signAlgoSigner.signMsigTx(jsonObject);

		const base64Blob = signedTxn.blob as string;
		const newJson = algosdk.decodeSignedTransaction(
			convertBase64ToUint8Array(base64Blob)
		);

		return { base64: base64Blob, json: newJson };
	} catch (error) {
		console.error(error);
		throw error;
	}
}
