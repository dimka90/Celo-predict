import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { type AppKitNetwork } from '@reown/appkit/networks'

// Celo Mainnet Network configuration
export const celoMainnetNetwork: AppKitNetwork = {
  id: 42220,
  name: 'Celo',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO-m',
    symbol: 'CELO-m',
  },
  rpcUrls: {
    default: {
      http: [
        'https://forno.celo.org',
        'https://rpc.ankr.com/celo',
        'https://celo-mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      ],
    },
  },
  blockExplorers: {
    default: { name: 'Celo Explorer', url: 'https://explorer.celo.org' },
  },
  testnet: false,
}

// Celo Sepolia Testnet Network configuration (Alchemy with fallback)
export const celoSepoliaNetwork: AppKitNetwork = {
  id: 11142220,
  name: 'Celo Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO-t',
    symbol: 'CELO-t',
  },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_RPC_URL || 'https://celo-sepolia.g.alchemy.com/v2/tjgIQUEkZoDp_7ACuP7nWxcwkNoWM6Je',
        process.env.NEXT_PUBLIC_RPC_URL_FALLBACK || 'https://celo-sepolia-rpc.allthatnode.com:8545',
        'https://celo-sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      ],
    },
  },
  blockExplorers: {
    default: { name: 'Celo Sepolia Explorer', url: 'https://sepolia.celoscan.io' },
  },
  testnet: true,
}

// Get project ID from environment
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '6a0514d82fb621e41aa6cad5473883a3'

// Create the networks array - Only Celo Sepolia testnet for development
const networks = [celoSepoliaNetwork] as [AppKitNetwork, ...AppKitNetwork[]]

// Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})

// Create AppKit instance with MiniPay support
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'CeloPredict - Connect Wallet',
    description: 'Connect your wallet to access decentralized prediction markets on Celo with MiniPay support',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://celopredict.vercel.app',
    icons: [typeof window !== 'undefined' ? `${window.location.origin}/logo.svg` : 'https://celopredict.vercel.app/logo.svg'],
  },
  features: {
    analytics: false, // Disable analytics to remove Reown tracking
    email: false,
    socials: false,
    emailShowWallets: false,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-font-family': 'var(--font-onest), system-ui, sans-serif',
    '--w3m-accent': '#22C7FF',
    '--w3m-color-mix': '#22C7FF',
    '--w3m-color-mix-strength': 25,
    '--w3m-border-radius-master': '16px',
    '--w3m-z-index': 2147483647, // Maximum z-index value
  },
  allWallets: 'SHOW', // Show all wallets
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
  ],
  // Improved connection settings
  enableWalletConnect: true,
  enableInjected: true, // Enable injected wallets (MiniPay uses this)
  enableEIP6963: true, // Enable EIP-6963 for better wallet discovery
  enableCoinbase: false, // Disable Coinbase for better performance
})

export const config = wagmiAdapter.wagmiConfig

// Contract addresses for smart contract integration - CELO DEPLOYMENT
// TODO: Deploy contracts to Celo and update these addresses
export const CONTRACT_ADDRESSES = {
  // Core Contracts (CELO - Update after deployment)
  PRIX_TOKEN: (process.env.NEXT_PUBLIC_PRIX_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  POOL_CORE: (process.env.NEXT_PUBLIC_POOL_CORE_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  BOOST_SYSTEM: (process.env.NEXT_PUBLIC_BOOST_SYSTEM_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  COMBO_POOLS: (process.env.NEXT_PUBLIC_COMBO_POOLS_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  FACTORY: (process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  
  // Oracle Contracts
  GUIDED_ORACLE: (process.env.NEXT_PUBLIC_GUIDED_ORACLE_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  OPTIMISTIC_ORACLE: (process.env.NEXT_PUBLIC_OPTIMISTIC_ORACLE_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  
  // System Contracts
  REPUTATION_SYSTEM: (process.env.NEXT_PUBLIC_REPUTATION_SYSTEM_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  STAKING_CONTRACT: (process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  
  // Legacy support (for backward compatibility)
  PREDINEX_POOL: (process.env.NEXT_PUBLIC_PREDINEX_POOL_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  PREDINEX_STAKING: (process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
}

// Network configuration for contract calls - CELO SEPOLIA
export const NETWORK_CONFIG = {
  chainId: 11142220, // Celo Sepolia Testnet
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://celo-sepolia.g.alchemy.com/v2/tjgIQUEkZoDp_7ACuP7nWxcwkNoWM6Je',
  explorerUrl: 'https://sepolia.celoscan.io',
}

// Global gas settings - Optimized for Celo Network
export const GAS_SETTINGS = {
  gas: BigInt(10000000), // 10M gas limit
  gasPrice: BigInt(1000000000), // 1 gwei (Celo optimized - typically lower than Ethereum)
  maxFeePerGas: BigInt(2000000000), // 2 gwei max fee
  maxPriorityFeePerGas: BigInt(100000000), // 0.1 gwei priority fee
}

// Robust network connection settings - CELO SEPOLIA
export const NETWORK_CONNECTION_CONFIG = {
  // Multiple RPC endpoints for redundancy (Celo Sepolia)
  rpcUrls: [
    'https://celo-sepolia.g.alchemy.com/v2/tjgIQUEkZoDp_7ACuP7nWxcwkNoWM6Je',
    'https://celo-sepolia-rpc.allthatnode.com:8545',
  ],
  // Connection retry settings
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  // Timeout settings
  requestTimeout: 30000, // 30 seconds
  // Health check settings
  healthCheckInterval: 60000, // 1 minute
}
