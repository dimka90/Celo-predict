// Celo Mainnet Network configuration
export const CELO_MAINNET_NETWORK = {
  chainId: '0xA4EC', // 42220 in hex
  chainName: 'Celo',
  nativeCurrency: {
    name: 'CELO',
    symbol: 'CELO',
    decimals: 18,
  },
  rpcUrls: ['https://forno.celo.org', 'https://rpc.ankr.com/celo'],
  blockExplorerUrls: ['https://explorer.celo.org'],
}

// Celo Alfajores Testnet Network configuration
export const CELO_ALFAJORES_NETWORK = {
  chainId: '0xAEF3', // 44787 in hex
  chainName: 'Celo Alfajores',
  nativeCurrency: {
    name: 'CELO',
    symbol: 'CELO',
    decimals: 18,
  },
  rpcUrls: ['https://alfajores-forno.celo.org', 'https://alfajores-forno.celo-testnet.org'],
  blockExplorerUrls: ['https://alfajores.celoscan.io'],
}

// Get network based on environment
const getCeloNetwork = () => {
  return process.env.NODE_ENV === 'production' ? CELO_MAINNET_NETWORK : CELO_ALFAJORES_NETWORK
}

export async function addCeloNetwork() {
  if (typeof window !== 'undefined' && window.ethereum) {
    const network = getCeloNetwork()
    try {
      // Try to switch to the network first
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      })
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [network],
          })
        } catch (addError) {
          console.error('Failed to add Celo network:', addError)
          throw addError
        }
      } else {
        console.error('Failed to switch to Celo network:', switchError)
        throw switchError
      }
    }
  } else {
    throw new Error('MetaMask is not installed')
  }
}

export function getCeloNetworkConfig() {
  return getCeloNetwork()
}

// Legacy exports for backward compatibility
export const addSomniaNetwork = addCeloNetwork
export const getSomniaNetworkConfig = getCeloNetworkConfig
export const addBSCNetwork = addCeloNetwork
export const getBSCNetworkConfig = getCeloNetworkConfig 