import { indexerClient } from "./utilities";

export async function assertAddrPartOfMultisig(
	multisigAddress: any[],
	address: string
) {
	if (
		Array.isArray(multisigAddress) &&
		!multisigAddress.find(
			(item: { address: string; signed: boolean }) => item.address === address
		)
	) {
		// if logged in a/c doesn't exist in msig array
		// check for rekey of msig addr
		const authAddrArray = [];
		for (const info of multisigAddress) {
			const accountInfo = await indexerClient()
				.lookupAccountByID(info.address)
				.do();
			authAddrArray.push(accountInfo?.account?.["auth-addr"]);
		}
		// current log-in addr isn't auth addr also
		if (!authAddrArray.find((item) => item === address)) {
			throw new Error(
				"Connected account address is not part of the given multisig transaction."
			);
		}
	}
}
