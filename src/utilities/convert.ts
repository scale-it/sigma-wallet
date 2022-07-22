import { decodeSignedTransaction } from "algosdk";

export function convertBase64ToUnit8Array(input: string): Uint8Array {
	return Uint8Array.from(Buffer.from(input, "base64"));
}

export function formatJSON(input: any): string {
	return JSON.stringify(input, null, 4);
}

export function convertObjectValuesToUnit8Array(input: any): Uint8Array {
	return new Uint8Array(Object.values(input));
}

export function convertToBase64(input: any): string {
	return Buffer.from(input).toString("base64");
}

export function prettifyJSON(input: string) {
	const transaction = decodeSignedTransaction(convertBase64ToUnit8Array(input));
	const txn = transaction.txn.get_obj_for_encoding();
	const subsig = transaction.msig?.subsig;

	for (const key in txn) {
		if (ArrayBuffer.isView(txn[key])) {
			txn[key] = convertToBase64(txn[key]);
		}
	}
	if (subsig) {
		for (const sig of subsig) {
			if (sig.pk) {
				sig.pk = convertToBase64(sig.pk);
			}
			if (sig.s) {
				sig.s = convertToBase64(sig.s);
			}
		}
	}
	transaction.txn = txn;
	return transaction;
}
