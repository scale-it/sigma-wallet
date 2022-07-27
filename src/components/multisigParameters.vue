<template>
	<div class="margin_top_med">
		<a-card title="Multisignature parameters">
			Addresses:
			<li
				v-for="ADDRESSES in mparams.addresses"
				:key="ADDRESSES.address"
				class="list_addresses"
			>
				<CheckCircleTwoTone v-if="ADDRESSES.signed" twoToneColor="LightGreen" />
				<CloseCircleTwoTone twoToneColor="red" v-else />
				{{ ADDRESSES.address }}
			</li>
			<p class="margin_top_med">
				Threshold: {{ mparams.threshold }}/{{ mparams.addresses.length }}
			</p>
			<p>Version: {{ mparams.version }}</p>
		</a-card>
	</div>
</template>

<script lang="ts">
import { MultisignatureParam } from "@/types";
import { convertBase64ToUnit8Array } from "@/utilities";
import { CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons-vue/";
import algosdk from "algosdk";
import { defineComponent } from "vue";

export default defineComponent({
	name: "Multiparameters-box",
	props: ["inputBase64"],
	components: {
		CheckCircleTwoTone,
		CloseCircleTwoTone,
	},
	data() {
		const mparams: MultisignatureParam = {
			addresses: [],
			version: 0,
			threshold: 0,
		};

		return {
			mparams,
			input: "base64",
		};
	},
	methods: {
		multiParams() {
			this.input = this.inputBase64;
			let jsonObject = algosdk.decodeObj(
				convertBase64ToUnit8Array(this.input)
			) as algosdk.EncodedSignedTransaction;
			const mparams = jsonObject.msig as algosdk.EncodedMultisig; //get information from subsig
			this.mparams.threshold = mparams.thr;
			this.mparams.version = mparams.v;
			this.mparams.addresses = mparams.subsig.map((signData) => {
				let address = algosdk.encodeAddress(signData.pk) as string;
				const signed = signData.s != null;
				return {
					address,
					signed,
				};
			});
		},
	},
	watch: {
		inputBase64() {
			this.multiParams();
		},
	},
});
</script>
