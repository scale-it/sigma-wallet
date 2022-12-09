<template>
	<a-alert
		v-if="error.length"
		message="Error"
		:description="error"
		type="error"
		show-icon
		closable
		@close="handleErrorModalClose"
	/>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
	name: "ErrorBlock",
	props: ["error", "updateError"],
	methods: {
		handleErrorModalClose() {
			this.$emit("updateError", "");
		},
	},
});
</script>
