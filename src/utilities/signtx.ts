import WalletStore from "@/store/WalletStore";
import { MyAlgoWalletSession, WebMode } from "@algo-builder/web";
import { JsonPayload, WalletMultisigMetadata } from "@algo-builder/web/build/algo-signer-types";
import algosdk, { encodeObj } from "algosdk";
import { toRaw } from "vue";
import { convertBase64ToUnit8Array, convertToBase64 } from "./convert";

export async function signMultisigUsingMyAlgoWallet(
	txnBase64: string,
	txn: algosdk.Transaction
) {
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

export async function signMultisigUsingAlgosigner(txnBase64: string,
	multisigParams: WalletMultisigMetadata) {
	const walletStore = WalletStore();
	const signAlgoSigner = walletStore.webMode as WebMode;
	const jsonObject = algosdk.decodeObj(
		convertBase64ToUnit8Array(txnBase64)
	) as algosdk.EncodedSignedTransaction;

	const msig = algosdk.Transaction.from_obj_for_encoding(
		jsonObject.txn
	);
	const bytes = algosdk.encodeObj(msig.get_obj_for_encoding());
	const txnBase64Signing = convertToBase64(bytes); // base64 of the transaction without signature

	const signedTxn = await signAlgoSigner.signTransaction([
		{
			txn: txnBase64Signing,
			msig: multisigParams,
		},
	]);
	const json = signedTxn[0] as JsonPayload;

	let combineBlob = encodeObj(json.blob as any)
	// we have multiple signatures 
	if (jsonObject.msig?.subsig.findIndex(item => item.s?.length) !== -1) {
		const blob1 = convertBase64ToUnit8Array(txnBase64);
		const blob2 = convertBase64ToUnit8Array(json.blob as string);
		combineBlob = algosdk.mergeMultisigTransactions([
			blob1,
			blob2,
		]);
	}

	const outputBase64 = convertToBase64(combineBlob);
	const newJson = algosdk.decodeSignedTransaction(combineBlob);
	return { base64: outputBase64, json: newJson, }
}