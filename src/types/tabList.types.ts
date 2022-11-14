export type contentlist = {
	JSON: string;
	MSG_PACK: string;
};

export type MultisignatureParam = {
	addresses: MultisigAddr[];
	threshold: number;
	version: number;
};

export type listAddresses = {
	id: number;
	address: string;
};

export type MultisigAddr = {
	address: string;
	signed: boolean;
};
