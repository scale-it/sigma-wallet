import { message, notification } from "ant-design-vue";

export const openSuccessNotificationWithIcon = (
	message: string,
	description?: string
) => {
	notification["success"]({
		message: message,
		description: description,
		duration: 0, // to close only when user prompts close button
		onClose: () => notification.close(""),
	});
};

export const loadingMessage = (key: string) => {
	message.loading({ content: "Loading...", key: key });
};

export const successMessage = (key: string) => {
	message.loading({ content: "Loaded", key: key });
};

export const successCopyAddress = (address: string) => {
	message.success("Address [" + address + "] copied!");
};

export const successMessageAnnounce = (key: string) => {
	message.success({ content: key, key: key });
};

export const TRANSACTION_SEND_SUCCESSFUL =
	"Your Transaction is sent successfully";

export const SIGN_SUCCESSFUL = "Your transaction is signed successfully";
