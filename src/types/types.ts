import {
	MyAlgoWalletSession,
	WallectConnectSession,
	WebMode,
} from "@algo-builder/web";

export type WebModeTypes =
	| WebMode
	| MyAlgoWalletSession
	| WallectConnectSession;
