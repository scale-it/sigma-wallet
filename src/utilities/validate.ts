export function isJson(str: any) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}

export function isObjectEmpty(obj: any): boolean {
	return Object.keys(obj).length === 0;
}
