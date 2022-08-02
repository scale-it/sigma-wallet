import { message, notification } from "ant-design-vue";

export const WALLET_NOT_CONNECT = "Please connect to your Wallet";

export const WALLET_CONNECTION_ERROR = (wallet: string) =>
	`Error occured while connecting with ${wallet}`;

export const openErrorNotificationWithIcon = (
	message: string,
	description?: string
) => {
	notification["error"]({
		message: message,
		description: description,
		duration: 0, // to close only when user prompts close button
		onClose: () => notification.close(""),
	});
};

export const errorMessage = (key: string) => {
	message.error({ content: "Error Occured", key: key });
};

export const UNSUCCESSFUL = "Unsuccessful";
export const wrongAddress = "Wrong multisigature parameters!";
export const wrongAddressDes =
	"Address generate from multisignature parameters is not equal to the sender of the transaction";
