import WalletStore from "@/store/WalletStore";
import { JsonPayload, WalletMultisigMetadata } from "@/types";
import { MyAlgoWalletSession, WebMode } from "@algo-builder/web";
import algosdk, { EncodedTransaction, encodeObj, Transaction } from "algosdk";
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
		if (
			typeof signedIndex === "number" &&
			myAlgoSignedTxn.msig?.subsig.length
		) {
			myAlgoSignedTxn.msig.subsig[signedIndex].s =
				initialSignedMsig?.subsig[signedIndex].s;
		}
		const outputBase64 = convertToBase64(encodeObj(myAlgoSignedTxn));
		return { base64: outputBase64, json: myAlgoSignedTxn };
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function signMultisigUsingAlgosigner(
	txnBase64: string,
	multisigParams: WalletMultisigMetadata
) {
	try {
		const walletStore = WalletStore();
		const signAlgoSigner = walletStore.webMode as WebMode;
		const jsonObject = algosdk.decodeObj(
			convertBase64ToUint8Array(txnBase64)
		) as algosdk.EncodedSignedTransaction;

		const bytes = algosdk.encodeObj(jsonObject.txn);
		const txnBase64Signing = convertToBase64(bytes); // base64 of the transaction without signature

		const signedTxn = await signAlgoSigner.signTransaction([
			{
				txn: txnBase64Signing,
				msig: multisigParams,
			},
		]);
		const json = signedTxn[0] as JsonPayload;

		let combineBlob = convertBase64ToUint8Array(json.blob as string);

		// we have multiple signatures
		if (jsonObject.msig?.subsig.findIndex((item) => item.s?.length) !== -1) {
			const blob1 = convertBase64ToUint8Array(txnBase64);
			const blob2 = convertBase64ToUint8Array(json.blob as string);
			combineBlob = algosdk.mergeMultisigTransactions([blob1, blob2]);
		}
		const newJson = algosdk.decodeSignedTransaction(combineBlob);
		const outputBase64 = convertToBase64(combineBlob);

		return { base64: outputBase64, json: newJson };
	} catch (error) {
		console.error(error);
		throw error;
	}
}
