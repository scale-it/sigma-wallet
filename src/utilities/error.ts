export function assertAddrPartOfMultisig(
	multisigAddress: any[],
	address: string
) {
	if (
		Array.isArray(multisigAddress) &&
		!multisigAddress.find(
			(item: { address: string; signed: boolean }) => item.address === address
		)
	) {
		throw new Error(
			"Connected account address is not part of the given multisig transaction."
		);
	}
}
