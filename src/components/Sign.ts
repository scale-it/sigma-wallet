import { TEST_NET_URL } from "@/constants";
import algosdk from "algosdk";
const mnemonic =
	"resist derive table space jealous person pink ankle hint venture manual spawn move harbor flip cigar copy throw swap night series hybrid chest absent art";

// elon
export const AccountI = {
	addr: "WHVQXVVCQAD7WX3HHFKNVUL3MOANX3BYXXMEEJEJWOZNRXJNTN7LTNPSTY",
	sk: algosdk.mnemonicToSecretKey(mnemonic).sk,
};

const m =
	"found empower message suit siege arrive dad reform museum cake evoke broom comfort fluid flower wheat gasp baby auction tuna sick case camera about flip";

// john
export const AccountII = {
	addr: "2UBZKFR6RCZL7R24ZG327VKPTPJUPFM6WTG7PJG2ZJLU234F5RGXFLTAKA",
	sk: algosdk.mnemonicToSecretKey(m).sk,
};
//console.log(algosdk.secretKeyToMnemonic(AccountII.sk));
const n =
	"brand globe reason guess allow wear roof leisure season coin own pen duck worth virus silk jazz pitch behave jazz leisure pave unveil absorb kick";
// alice
export const AccountIII = {
	addr: "EDXG4GGBEHFLNX6A7FGT3F6Z3TQGIU6WVVJNOXGYLVNTLWDOCEJJ35LWJY",
	sk: algosdk.mnemonicToSecretKey(n).sk,
};

const algodToken =
	"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const algodServer = "http://localhost";
const algodPort = 4001;
const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
const testNetAlgodClient = new algosdk.Algodv2("", TEST_NET_URL, "");

async function showBalance() {
	const accountInfoI = await algodClient.accountInformation(AccountI.addr).do();
	console.log("Account balance 1: %d microAlgos", accountInfoI.amount);

	const accountInfoII = await algodClient
		.accountInformation(AccountII.addr)
		.do();
	console.log("Account balance 2: %d microAlgos", accountInfoII.amount);

	const accountInfoIII = await algodClient
		.accountInformation(AccountIII.addr)
		.do();
	console.log("Account balance 3: %d microAlgos", accountInfoIII.amount);
}

async function showTestNetBalance() {
	const accountInfoI = await testNetAlgodClient
		.accountInformation(AccountI.addr)
		.do();
	console.log("Account balance 1: %d microAlgos", accountInfoI.amount);

	const accountInfoII = await testNetAlgodClient
		.accountInformation(AccountII.addr)
		.do();
	console.log("Account balance 2: %d microAlgos", accountInfoII.amount);

	const accountInfoIII = await testNetAlgodClient
		.accountInformation(AccountIII.addr)
		.do();
	console.log("Account balance 3: %d microAlgos", accountInfoIII.amount);
}

async function createMul() {
	const mparams = {
		version: 1,
		threshold: 2,
		addrs: [AccountI.addr, AccountII.addr, AccountIII.addr],
	};

	const multisigaddr = algosdk.multisigAddress(mparams);
	console.log("Multisig Address: " + multisigaddr);
}

export async function Execute() {
	// await showBalance();
	// await createMul();
	const mparams = {
		version: 1,
		threshold: 2,
		addrs: [AccountI.addr, AccountII.addr, AccountIII.addr],
	};

	const multisigaddr = algosdk.multisigAddress(mparams);
	// console.log("mine", await algodClient.accountInformation(multisigaddr).do());
	// console.log("Multisig Address: " + multisigaddr);

	// const params = await algodClient.getTransactionParams().do();
	const testNetParams = await testNetAlgodClient.getTransactionParams().do();
	// params.fee = 1000;
	// params.flatFee = true;

	testNetParams.fee = 1000;
	testNetParams.flatFee = true;

	const receiver = AccountIII.addr;
	const names = '{"firstName": "John", "lastName":"Doe"}';
	const enc = new TextEncoder();
	const note = enc.encode(names);
	// const txn = algosdk.makePaymentTxnWithSuggestedParams(
	// 	multisigaddr,
	// 	receiver,
	// 	1,
	// 	undefined,
	// 	note,
	// 	params
	// );
	const testNetTxn = algosdk.makePaymentTxnWithSuggestedParams(
		multisigaddr,
		receiver,
		1,
		undefined,
		note,
		testNetParams
	);
	// const txId = txn.txID().toString();
	// console.log("Transaction: On private-net");
	// console.log(txn);

	// const pay_txn_bytes = algosdk.encodeObj(txn.get_obj_for_encoding());
	// console.log(Buffer.from(pay_txn_bytes).toString("base64"));
	// console.log(
	// 	Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString("base64")
	// );

	// const rawSignedTxn = algosdk.signMultisigTransaction(
	// 	txn,
	// 	mparams,
	// 	AccountI.sk
	// );

	// const twosigs = algosdk.appendSignMultisigTransaction(
	// 	rawSignedTxn.blob,
	// 	mparams,
	// 	AccountIII.sk
	// );
	// const blob = twosigs.blob;
	// console.log("Signed Transaction in JSON Format");
	// console.log(twosigs);
	// console.log("Base64 Transaction");
	// console.log(Buffer.from(blob).toString("base64"));
	// console.log("-----End-----");

	await showTestNetBalance();
	console.log("Transaction: On Test-net");
	console.log(testNetTxn);
	const testNetrawSignedTxn = algosdk.signMultisigTransaction(
		testNetTxn,
		mparams,
		AccountI.sk
	);

	const testNettwosigs = algosdk.appendSignMultisigTransaction(
		testNetrawSignedTxn.blob,
		mparams,
		AccountIII.sk
	);

	console.log("Signed Transaction in JSON Format");
	console.log(testNettwosigs);
	const decode = algosdk.decodeSignedTransaction(testNettwosigs.blob);
	console.log(decode);
	const encode = algosdk.encodeObj(decode);
	console.log(encode);
	console.log("Base64 Transaction");
	console.log(Buffer.from(testNettwosigs.blob).toString("base64"));
	console.log(Buffer.from(JSON.stringify(decode)).toString("base64"));
	console.log("-----End-----");
	return;
	// const decodeTx1 = algosdk.decodeSignedTransaction(rawSignedTxn.blob);
	// const decodeTx2 = algosdk.decodeSignedTransaction(twosigs);
	// console.log(decodeTx1);
	// console.log(decodeTx2);

	// console.log("--------------");
	// console.log(encodeSDK);
	// console.log(rawSignedTxn.blob);
	// console.log("---------------------");
	// const encodeSDK = algosdk.decodeSignedTransaction(twosigs);
	// console.log(encodeSDK.msig.subsig);

	// console.log("-----**-------");
	// const dx = algosdk.decodeObj(rawSignedTxn.blob); //Use decodeObj would be better
	//console.log(dx);
	//console.log(decodeTx1);
	// const iki = algosdk.encodeObj(dx);
	//console.log(iki);

	// await algodClient.sendRawTransaction(twosigs).do();

	// // Wait for confirmation
	// const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
	// //Get the completed Transaction
	// console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
	// let mytxinfo = JSON.stringify(confirmedTxn.txn.txn, undefined, 2);
	// console.log("Transaction information: %o", mytxinfo);
	// let string = new TextDecoder().decode(confirmedTxn.txn.txn.note);
	// console.log("Note field: ", string);
	// const obj = JSON.parse(string);
	// console.log("Note first name: %s", obj.firstName);
}
