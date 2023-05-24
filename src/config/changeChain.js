import WalletConnectors from "./connectors";

const chainId1 = 2222;

export const changeChain = async (chain) => {
  const { injected } = WalletConnectors();
  const provider = await injected.getProvider();
  if (provider) {
    try {
      if(chain === "kava") {
        await provider.request({
        method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${chainId1.toString(16)}` }],
        });
      }
      return true
    } catch (error) {
      console.error('Failed to setup the network in Metamask:', error)
      return false
    }
  } else {
    console.error("Can't setup the Blockchain on wallet because provider is undefined")
    return false
  }
}

export default changeChain;
