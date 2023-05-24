import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
const POLLING_INTERVAL = 12000;
const RPC_URL1 = "https://evm.kava.io/";

const walletConnectors = () => {

    const injected = new InjectedConnector({
        supportedChainIds: [2222],
    });
    
    const walletconnect = new WalletConnectConnector({
        rpc: { 2222: RPC_URL1 },
        bridge: "https://bridge.walletconnect.org",
        qrcode: true,
        pollingInterval: POLLING_INTERVAL,
    });

    return {injected, walletconnect};
}

export default walletConnectors;
