export function convertBase64ToUnit8Array(input: string) {
	return Buffer.from(input, "base64");
}

export function formatJSON(input: any) {
	return JSON.stringify(input, null, 4);
}

export function convertObjectValuesToUnit8Array(input: any) {
	return new Uint8Array(Object.values(input));
}

export function convertToBase64(input: any) {
	return Buffer.from(input).toString("base64");
}
