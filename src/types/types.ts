import {
	MyAlgoWalletSession,
	WallectConnectSession,
	WebMode,
} from "@algo-builder/web";
import { Transaction } from "algosdk";

export type WebModeTypes =
	| WebMode
	| MyAlgoWalletSession
	| WallectConnectSession;

export type TransactionKeys = keyof Transaction;
