import { TransactionKeys } from "@/types";
import algosdk, {
	Address,
	EncodedSubsig,
	SignedTransaction,
	Transaction,
} from "algosdk";

export function convertBase64ToUint8Array(input: string): Uint8Array {
	return Uint8Array.from(Buffer.from(input, "base64"));
}

export function prettifyJSON(input: any): string {
	return JSON.stringify(input, null, 4);
}

export function convertObjectValuesToUint8Array(input: any): Uint8Array {
	return new Uint8Array(Object.values(input));
}

export function convertToBase64(input: any): string {
	return Buffer.from(input).toString("base64");
}

// https://algorand.github.io/js-algorand-sdk/interfaces/SignedTransaction.html
/**
 * Takes the JSON object (where Uint8Array values are converted to Object) encode them Uint8Array and returns encoded Uint8Array of whole JSON object
 * @param object object to be encoded
 */

export function decodeSignedMsigTransaction(
	object: SignedTransaction
): Uint8Array {
	// only those values in txn are taken which are object i.e Uint8Array converted to object
	function decodeTransactionObject(txn: Transaction): Transaction {
		for (const key in txn) {
			// Address type
			if (key === "appAccounts") {
				txn[key] = txn[key]?.map((item: Address) => {
					item.checksum = convertObjectValuesToUint8Array(item.checksum);
					item.publicKey = convertObjectValuesToUint8Array(item.publicKey);
					return item;
				});
			} else if (
				typeof txn[key as TransactionKeys] === "object" &&
				!Array.isArray(txn[key as TransactionKeys])
			) {
				if (
					new Object(txn[key as TransactionKeys]).hasOwnProperty("checksum")
				) {
					txn[key].checksum = convertObjectValuesToUint8Array(
						txn[key].checksum
					);
				}
				if (
					new Object(txn[key as TransactionKeys]).hasOwnProperty("publicKey")
				) {
					txn[key].publicKey = convertObjectValuesToUint8Array(
						txn[key].publicKey
					);
				} else if (txn[key]?.type === "Buffer") {
					txn[key] = new Uint8Array(txn[key].data);
				} else {
					txn[key] = convertObjectValuesToUint8Array(txn[key]);
				}
			}
		}

		return txn;
	}
	if (object?.msig && object.msig?.subsig) {
		object.msig.subsig = object.msig.subsig.map((item: EncodedSubsig) => {
			if (item.pk) {
				item.pk = convertObjectValuesToUint8Array(item.pk);
			}
			if (item.s) {
				item.s = convertObjectValuesToUint8Array(item.s);
			}
			return item;
		});

		// if the transactions are grouped
		if (Array.isArray(object.txn)) {
			object.txn = object.txn.map((txn: Transaction) =>
				decodeTransactionObject(txn)
			);
		} else object.txn = decodeTransactionObject(object.txn);
	}
	return algosdk.encodeObj(object);
}
