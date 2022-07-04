export function convertBase64ToUnit8Array(input: string): Uint8Array {
	return Uint8Array.from(Buffer.from(input, "base64"));
}

export function formatJSON(input: any): string {
	return JSON.stringify(input, null, 4);
}

export function convertObjectValuesToUnit8Array(input: any): Uint8Array {
	return new Uint8Array(Object.values(input));
}

export function convertToBase64(input: any): string {
	return Buffer.from(input).toString("base64");
}
