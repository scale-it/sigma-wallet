<template>
	<a-popover>
		<template #content>
			<p>
				{{ data }}
			</p>
		</template>
		<DeleteOutlined v-if="icon === Action.DELETE" />
		<SaveOutlined v-if="icon === Action.SAVE" />
		<EditOutlined v-if="icon === Action.EDIT" />
		<CopyOutlined v-if="icon === Action.COPY" />
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

import { Action } from "@/constants";

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
			Action,
		};
	},
});
</script>
