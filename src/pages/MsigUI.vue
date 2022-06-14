<template>
	<div class="row">
		<div class="col-sm-5" style="background-color: lavender">
			<div class="form-group">
				<label for="comment"><h1>Unsigned transaction:</h1></label> <br />
				<textarea
					:class="formControl"
					v-model="unsignedJson"
					placeholder="add multiple lines"
				></textarea>
			</div>
		</div>
		<div class="col-sm-2" style="background-color: lavenderblush">
			<button :class="buttonClass" @click="sign">Sign</button>
		</div>
		<div class="col-sm-5" style="background-color: lavender">
			<div class="form-group">
				<label for="comment"><h1>Signed transaction:</h1></label> <br />
				<textarea
					:class="formControl"
					v-model="signedJson"
					placeholder="add multiple lines"
				></textarea>
			</div>
		</div>
	</div>
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
