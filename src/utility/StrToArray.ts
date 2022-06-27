export default function str2arr(str: string) {
	const buf = new ArrayBuffer(str.length * 1); // 2 bytes for each char
	const bufView = new Uint8Array(buf);
	for (let i = 0, strLen = str.length; i < strLen; i++) {
		bufView[i] = str.charCodeAt(i);
	}
	return buf;
}
