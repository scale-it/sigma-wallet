<template>
	<div class="margin_top_med">
		<a-card title="Multisignature parameters">
			Addresses:
			<a-list size="small" :data-source="mparams.addresses">
				<template #renderItem="{ item }">
					<a-list-item class="list_addresses">
						<CheckCircleOutlined
							v-if="item.signed"
							:style="'color: ' + CHECK_ICON_COLOR"
						/>
						<CloseCircleOutlined v-else :style="'color: ' + CLOSE_ICON_COLOR" />
						{{ getTruncatedAddress(item.address) }}
						<template #actions>
							<a-button
								type="link"
								shape="circle"
								size="small"
								ghost
								@click="copy(item.address)"
							>
								<template #icon>
									<CopyOutlined />
								</template>
							</a-button>
						</template>
					</a-list-item>
				</template>
			</a-list>
			<div class="margin_top_med">
				<div v-if="mparams.addresses.length != 0">
					Threshold
					<InfoToolTip
						:data="
							mparams.threshold +
							' out of ' +
							mparams.addresses.length +
							' signatures are required to approve the transaction'
						"
					/>: {{ mparams.threshold }}/{{ mparams.addresses.length }}
				</div>
				<div v-else>
					Threshold
					<InfoToolTip
						:data="'Number of signature required to approve the transaction'"
					/>: {{ mparams.threshold }}/{{ mparams.addresses.length }}
				</div>
			</div>

			<p>Version: {{ mparams.version }}</p>
		</a-card>
	</div>
</template>

<script lang="ts">
import { MultisignatureParam } from "@/types";
import { convertBase64ToUnit8Array, copyToClipboard } from "@/utilities";
import {
	CheckCircleOutlined,
	CloseCircleOutlined,
	CopyOutlined,
} from "@ant-design/icons-vue/";
import algosdk from "algosdk";
import { defineComponent } from "vue";
import {
	CHECK_ICON_COLOR,
	CLOSE_ICON_COLOR,
	successCopyAddress,
} from "@/constants";
import InfoToolTip from "@/components/InfoToolTip.vue";

export default defineComponent({
	name: "Multiparameters-box",
	props: ["inputBase64"],
	components: {
		CloseCircleOutlined,
		CheckCircleOutlined,
		CopyOutlined,
		InfoToolTip,
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
			CHECK_ICON_COLOR,
			CLOSE_ICON_COLOR,
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
		getTruncatedAddress(addr: string) {
			return addr.substring(0, 15) + "..." + addr.slice(-15);
		},
		copy(address: string) {
			copyToClipboard(address);
			successCopyAddress(address);
		},
	},
	watch: {
		inputBase64() {
			this.multiParams();
		},
	},
});
</script>
