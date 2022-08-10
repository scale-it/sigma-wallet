export type contentlist = {
	JSON: string;
	MSG_PACK: string;
};

export type MultisignatureParam = {
	addresses: { address: string; signed: boolean }[];
	threshold: number;
	version: number;
};

export type listAddresses = {
	id: number;
	address: string;
};
