const token =
	process.env.ALGOSDK_TOKEN ||
	"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const server = process.env.ALGOSDK_URL || "http://localhost";
const port = process.env.ALGOSDK_PORT || 4001;

export { token, server, port, };
