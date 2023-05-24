export const handleValueTime = 500 // 0.5s

export const contractAddresses = {
	'kava': {
		'router': '0xC04bf3d7f99DeADF808EB9095bf46dBc387EA34c',
		'hedgeFactory': '0xdd05Ab7bFFA6929BA7Dd1571f3e8982D0CFb6469'
	}
}

export const defaultTokenList = {
	'kava': [
		{ value: "kava", chainId: 2222, address: "0x0000000000000000000000000000000000000000", symbol: "KAVA", name: "KAVA Coin", decimals: 18, logoURL: "https://assets-cdn.trustwallet.com/blockchains/kava/info/logo.png", tags: ["Coin"] },
		{ value: "axlusdc", chainId: 2222, address: "0xeb466342c4d449bc9f53a865d5cb90586f405215", symbol: "axlUSDC", name: "Axelar Wrapped USDC", decimals: 18, logoURL: "https://cryptologos.cc/logos/usd-coin-usdc-logo.svg", tags: ["stablecoin"] },
		{ value: "wkava", chainId: 2222, address: "0xc86c7c0efbd6a49b35e8714c5f59d99de09a225b", symbol: "WKAVA", name: "Wrapped KAVA", decimals: 18, logoURL: "https://assets-cdn.trustwallet.com/blockchains/kava/info/logo.png", tags: ["Coin"] },
	]
}

export const defaultProvider = {
	'kava': 'https://evm.kava.io'
}

export const chainIds = {
	'kava': 2222
}

export const userSettings = "Gamut_settings";
export const customList = "customList";
export const customPoolList = "customPoolList";
// export const tokenListLink = "https://gateway.pinata.cloud/ipfs/QmSxSrj95qFFr4JhUshYBa17wLR7XeXETE47xjEd8TcSU4";

export const tokenList = { "kava": [
	{"value":"wkava","chainId":2222,"address":"0xc86c7c0efbd6a49b35e8714c5f59d99de09a225b","symbol":"WKAVA","name":"Wrapped KAVA","decimals":18,"logoURL":"https://assets-cdn.trustwallet.com/blockchains/kava/info/logo.png","tags":["Coin"]},
	{"value":"kava","chainId":2222,"address":"0x0000000000000000000000000000000000000000","symbol":"KAVA","name":"KAVA Coin","decimals":18,"logoURL":"https://assets-cdn.trustwallet.com/blockchains/kava/info/logo.png","tags":["Coin"]},
	{"value":"wbtc","chainId":2222,"address":"0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b","symbol":"WBTC","name":"Wrapped BTC","decimals":8,"logoURL":"https://cryptologos.cc/logos/bitcoin-btc-logo.svg","tags":["Coin"]},
	{"value":"weth","chainId":2222,"address":"0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d","symbol":"ETH","name":"Ethereum","decimals":18,"logoURL":"https://cryptologos.cc/logos/ethereum-eth-logo.svg","tags":["Coin"]},
	{"value":"axlusdc","chainId":2222,"address":"0xeb466342c4d449bc9f53a865d5cb90586f405215","symbol":"axlUSDC","name":"Axelar Wrapped USDC","decimals":6,"logoURL":"https://cryptologos.cc/logos/usd-coin-usdc-logo.svg","tags":["stablecoin"]},
	{"value":"elk","chainId":2222,"address":"0xeeeeeb57642040be42185f49c52f7e9b38f8eeee","symbol":"ELK","name":"Elk","decimals":18,"logoURL":"/icons/elk.svg","tags":["stablecoin"]},
	{"value":"axl","chainId":2222,"address":"0x23ee2343b892b1bb63503a4fabc840e0e2c6810f","symbol":"AXL","name":"Axelar","decimals":6,"logoURL":"/icons/axl.svg","tags":["stablecoin"]},
]};

export const poolList = {
	'kava': [
		{ value: "other", address: "0x25bcA9E2B311dE3611627b0953A69A6e646968e1", symbols: ["axlUSDC", "WKAVA"], logoURLs: ["/icons/usdc.svg", "/icons/wkava.png"] },
		{ value: "other", address: "0x12cf7f580C82329851c9F122be72cD6a26e030ff", symbols: ["axlUSDC", "WBTC"], logoURLs: ["/icons/usdc.svg", "/icons/wbtc.png"] },
		{ value: "other", address: "0xdf8D9C2eE3dd09e9D420C4384400Adc29b799545", symbols: ["axlUSDC", "ETH"], logoURLs: ["/icons/usdc.svg", "/icons/eth.png"] },
		{ value: "other", address: "0x6B4F8d7d330F71a7B4fd706E11a974e9D8B25239", symbols: ["axlUSDC", "ELK"], logoURLs: ["/icons/usdc.svg", "/icons/elk.png"] },
		{ value: "other", address: "0x31D97cad1Ab7aAA4Db9b2C7562948D9C244a5171", symbols: ["axlUSDC", "AXL"], logoURLs: ["/icons/usdc.svg", "/icons/axl.svg"] },
		{ value: "other", address: "0xe5a3Af14Cdf4D7CE495650c7E9Fc35bd29A277A3", symbols: ["WKAVA", "ETH"], logoURLs: ["/icons/wkava.svg", "/icons/eth.png"] },
		{ value: "other", address: "0x0E916a0D53a6D5E38A8F80bA59204Fcadecf1D44", symbols: ["WKAVA", "WBTC"], logoURLs: ["/icons/wkava.svg", "/icons/wbtc.png"] },
		{ value: "other", address: "0x69F85DB1E51154Ae6B2803D5292c692d9598FF57", symbols: ["WBTC", "ETH"], logoURLs: ["/icons/wbtc.svg", "/icons/eth.png"] },
	]
}

export const farmingPoolList = {
	'kava': []
}
