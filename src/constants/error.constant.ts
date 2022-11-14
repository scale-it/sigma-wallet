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

export const NO_WALLET = "You need to login your wallet to sign transaction!";
export const WALLET_NOT_SUPPORTED =
	"We are currently unable to support Wallet Connect(Pera wallet) to sign multisignature transaction";
