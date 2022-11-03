import {
	encodeAddress,
	EncodedSignedTransaction,
	SignedTransaction,
} from "algosdk";
export function convertBase64ToUnit8Array(input: string): Uint8Array {
	return Uint8Array.from(Buffer.from(input, "base64"));
}

export function formatJSON(input: any): string {
	return JSON.stringify(input, null, 4);
}

export function convertToBase64(input: any): string {
	return Buffer.from(input).toString("base64");
}

export function prettifyTransaction(
	tx: SignedTransaction | EncodedSignedTransaction
) {
	// need to set any type else there are multiple type errors since we are formatting the JSON unsimilar to any prescribed Transaction type
	const formatTransaction: any = Object.assign({}, tx);
	let txn: any = tx.txn;
	// that means the transaction is SignedTransaction
	if (typeof formatTransaction.txn.get_obj_for_encoding === "function") {
		txn = formatTransaction.txn.get_obj_for_encoding();
	}

	let subsig = formatTransaction.msig?.subsig;
	// encoding the uint8Array values to base64
	for (const key in txn) {
		if (ArrayBuffer.isView(txn[key])) {
			if (key === "rcv" || key === "snd" || key === "from" || key === "to") {
				txn[key] = encodeAddress(txn[key]);
			} else if (key === "note") {
				txn[key] = JSON.parse(new TextDecoder().decode(txn[key]));
			} else {
				txn[key] = convertToBase64(txn[key]);
			}
		}
	}

	if (subsig) {
		subsig = subsig.map((sig: any) => {
			sig.pk = encodeAddress(sig.pk);
			if (sig.s) {
				sig.s = convertToBase64(sig.s);
			}
			return sig;
		});
	}
	formatTransaction.msig.subsig = subsig;
	formatTransaction.txn = txn;
	return formatTransaction;
}
