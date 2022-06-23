<template>
	<a-row>
		<a-col :span="10">
			<h1>Unsigned transaction</h1>
		</a-col>
		<a-col :span="4"> </a-col>
		<a-col :span="10">
			<h1>Signed transaction:</h1>
		</a-col>
	</a-row>
	<a-row>
		<a-col :span="10">
			<a-textarea
				v-model:value="unsignedJson"
				placeholder="Basic usage"
				:rows="4"
				allow-clear
			/>
		</a-col>
		<a-col :span="4">
			<div>
				<a-button type="primary" @click="sign">Sign</a-button>
			</div>
		</a-col>
		<a-col :span="10">
			<a-textarea
				v-model:value="signedJson"
				placeholder="Basic usage"
				:rows="4"
			/>
		</a-col>
	</a-row>
</template>

<script lang="ts">
import WalletStore from "@/store/WalletStore";
import algosdk, {Transaction} from "algosdk";
import str2arr from "../utility/StrToArray";

export default {
	name: "Multisignature UI",
	data() {
		const walletStore = WalletStore();
		return {
			unsignedJson: "",
			signedJson: "",
			buttonClass: "btn btn-danger",
			formControl: "form-control",
			walletStore,
			Transaction,
		};
	},
	methods: {
		sign() {
			this.signedJson = this.walletStore.address;
			let txn = str2arr(this.unsignedJson);
			let haha = new Uint8Array(5);
			haha[0] = 5;
			console.log(txn);
			console.log(haha);
			//let Encodetxn = algosdk.encodeUnsignedTransaction(txn);
			//let tmpTxt = new algosdk.Transaction(txn);
			//console.log("Encoded Txn: " + Encodetxn);
			//console.log("Transaction: " + tmpTxt);
			// let decodeTxn = algosdk.decodeObj(Encodetxn);
			// console.log("Decoded Txn: " + decodeTxn);
			// //console.log("Transaction:" + txn);
			// //console.log("tobyte: " + this.Transaction.toByte());
			// let signedTxn = this.walletStore.webMode.signTransaction(decodeTxn);
			// console.log("Signed Transaction: " + signedTxn);
		},
	},
};
</script>
