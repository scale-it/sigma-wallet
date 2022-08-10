<template>
	<a-popover>
		<template #content>
			<p>
				{{ data }}
			</p>
		</template>
		<DeleteOutlined v-if="icon === action.delete" />
		<SaveOutlined v-if="icon === action.save" />
		<EditOutlined v-if="icon === action.edit" />
		<CopyOutlined v-if="icon === action.copy" />
	</a-popover>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
	DeleteOutlined,
	EditOutlined,
	SaveOutlined,
	CopyOutlined,
} from "@ant-design/icons-vue";

import { action } from "@/constants";

export default defineComponent({
	name: "IconWithToolTip",
	components: {
		DeleteOutlined,
		SaveOutlined,
		EditOutlined,
		CopyOutlined,
	},
	props: ["data", "icon"],
	data() {
		return {
			action,
		};
	},
});
</script>
