<template>
	<a-breadcrumb class="margin_bottom_sm">
		<a-breadcrumb-item
			><a @click="redirectToInitMsig">Init Msig</a></a-breadcrumb-item
		>
		<a-breadcrumb-item>Create Txn</a-breadcrumb-item>
	</a-breadcrumb>
	<h4>
		You can use the following script to create transaction and encode it in
		base64 to be used in <code>InitMsig</code>
	</h4>
	<div class="highlight_container">
		<code-highlight :aria-multiline="true" language="javascript">
			<pre>
		// Construct the transaction
		let params = await algodClient.getTransactionParams().do();
		// comment out the next two lines to use suggested fee
		params.fee = algosdk.ALGORAND_MIN_TX_FEE;
		params.flatFee = true;

		// receiver defined as TestNet faucet address
		const receiver =
			"HZ57J3K46JIJXILONBBZOHX6BKPXEM2VVXNRFSUED6DKFD5ZD24PMJ3MVA";
		const enc = new TextEncoder();
		const note = enc.encode("Hello World");
		let amount = 1000000;
		let sender = myAccount.addr;
		let txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
			from: sender,
			to: receiver,
			amount: amount,
			note: note,
			suggestedParams: params,
		});

		// convert transaction to base64 for use in InitMsig
		const base64Txn = Buffer.from(
			algosdk.encodeObj(txn.get_obj_for_encoding())
		).toString("base64");
			</pre
			>
		</code-highlight>
	</div>
</template>

<script lang="ts">
import { EndPoint } from "@/types";
import { defineComponent } from "vue";
import CodeHighlight from "vue-code-highlight/src/CodeHighlight.vue";
import "vue-code-highlight/themes/duotone-sea.css";
import "vue-code-highlight/themes/window.css";
import { redirectTo } from "@/utilities";

export default defineComponent({
	name: "CreateTxn",
	components: {
		CodeHighlight,
	},
	methods: {
		redirectToInitMsig() {
			redirectTo(this.$router, EndPoint.HOME_PAGE);
		},
	},
});
</script>
