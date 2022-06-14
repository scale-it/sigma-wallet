<template>
    <a-row>
        <a-col :span="10">
            <h1>Unsigned transaction</h1>
        </a-col>
        <a-col :span="4">
        </a-col>
        <a-col :span="10">
            <h1>Signed transaction:</h1>
        </a-col>
    </a-row>
    <a-row>
        <a-col :span="10">
            <a-textarea v-model:value="unsignedJson" placeholder="Basic usage" :rows="4" allow-clear/>
        </a-col>
        <a-col :span="4">
            <div>
                <a-button type="primary" @click="sign">Sign</a-button>
            </div>
        </a-col>
        <a-col :span="10">
            <a-textarea v-model:value="signedJson" placeholder="Basic usage" :rows="4" />

        </a-col>
    </a-row>
</template>

<script>
export default {
	name: "Multisignature UI",
	data() {
		return {
			unsignedJson: "",
			signedJson: "",
			buttonClass: "btn btn-danger",
			formControl: "form-control",
		};
	},
	methods: {
		sign() {
			this.signedJson = this.unsignedJson;
		},
	},
};
</script>
