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
export const WRONG_ADDRESS = "Wrong multisigature parameters!";
export const WRONG_ADDRESSES =
	"Address generate from multisignature parameters is not equal to the sender of the transaction";

export const NO_WALLET = "You need to login your wallet to sign transaction!";
export const NOT_SUPPORT_WALLET =
	"We are currently unable to support MyAlgo and Wallet Connect to sign multisigature transaction";
