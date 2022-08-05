<template>
	<a-popover>
		<template #content>
			<p>
				{{ data }}
			</p>
		</template>
		<DeleteOutlined v-if="icon === 'Delete'" />
		<SaveOutlined v-if="icon === 'Save'" />
		<EditOutlined v-if="icon === 'Edit'" />
		<CopyOutlined v-if="icon === 'Copy'" />
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

export default defineComponent({
	name: "IconWithToolTip",
	components: {
		DeleteOutlined,
		SaveOutlined,
		EditOutlined,
		CopyOutlined,
	},
	props: ["data", "icon"],
});
</script>
