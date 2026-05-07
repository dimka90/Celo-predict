import { createPublicClient, http, type PublicClient, defineChain } from 'viem';
import { NETWORK_CONNECTION_CONFIG, GAS_SETTINGS } from '@/config/wagmi';

// Define Celo chains for Viem compatibility
const celoMainnetChain = defineChain({
  id: 42220,
  name: 'Celo',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://forno.celo.org'],
    },
  },
  blockExplorers: {
    default: { name: 'Celo Explorer', url: 'https://explorer.celo.org' },
  },
  testnet: false,
});

const celoAlfajoresChain = defineChain({
  id: 44787,
  name: 'Celo Alfajores',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://alfajores-forno.celo.org'],
    },
  },
  blockExplorers: {
    default: { name: 'Celo Alfajores Explorer', url: 'https://alfajores.celoscan.io' },
  },
  testnet: true,
});

// Use testnet in development, mainnet in production
const celoChain = process.env.NODE_ENV === 'production' ? celoMainnetChain : celoAlfajoresChain;

// Network connection manager for robust Celo connectivity
class NetworkConnectionManager {
  private clients: PublicClient[] = [];
  private currentClientIndex = 0;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isHealthy = true;

  constructor() {
    this.initializeClients();
    this.startHealthCheck();
  }

  private initializeClients() {
    // Create multiple clients for redundancy
    this.clients = NETWORK_CONNECTION_CONFIG.rpcUrls.map((rpcUrl) => {
      return createPublicClient({
        chain: celoChain,
        transport: http(rpcUrl, {
          timeout: NETWORK_CONNECTION_CONFIG.requestTimeout,
          retryCount: NETWORK_CONNECTION_CONFIG.retryAttempts,
          retryDelay: NETWORK_CONNECTION_CONFIG.retryDelay,
        }),
      });
    });
  }

  private async startHealthCheck() {
    // Only start health check if interval is set (production mode)
    if (NETWORK_CONNECTION_CONFIG.healthCheckInterval > 0) {
      this.healthCheckInterval = setInterval(async () => {
        await this.checkHealth();
      }, NETWORK_CONNECTION_CONFIG.healthCheckInterval);
    }
  }

  private async checkHealth() {
    try {
      const client = this.getCurrentClient();
      await client.getBlockNumber();
      this.isHealthy = true;
    } catch (error) {
      console.warn('Network health check failed, switching to backup RPC:', error);
      this.isHealthy = false;
      this.switchToNextClient();
    }
  }

  private switchToNextClient() {
    this.currentClientIndex = (this.currentClientIndex + 1) % this.clients.length;
    console.log(`Switched to RPC endpoint ${this.currentClientIndex + 1}`);
  }

  public getCurrentClient(): PublicClient {
    return this.clients[this.currentClientIndex];
  }

  public getHealthyClient(): PublicClient {
    if (this.isHealthy) {
      return this.getCurrentClient();
    }
    
    // Try to find a healthy client
    for (let i = 0; i < this.clients.length; i++) {
      const client = this.clients[i];
      try {
        // Quick health check
        client.getBlockNumber();
        this.currentClientIndex = i;
        this.isHealthy = true;
        return client;
      } catch {
        continue;
      }
    }
    
    // If all clients are unhealthy, return the current one
    return this.getCurrentClient();
  }

  public async executeWithRetry<T>(
    operation: (client: PublicClient) => Promise<T>,
    maxRetries: number = NETWORK_CONNECTION_CONFIG.retryAttempts
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const client = this.getHealthyClient();
        return await operation(client);
      } catch (error) {
        lastError = error as Error;
        console.warn(`Network operation failed (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
        
        if (attempt < maxRetries) {
          // Switch to next client and wait before retry
          this.switchToNextClient();
          await new Promise(resolve => setTimeout(resolve, NETWORK_CONNECTION_CONFIG.retryDelay));
        }
      }
    }
    
    throw new Error(`Network operation failed after ${maxRetries + 1} attempts: ${lastError?.message}`);
  }

  public destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
}

// Singleton instance
export const networkManager = new NetworkConnectionManager();

// Utility functions for contract interactions
export async function getPublicClient(): Promise<PublicClient> {
  return networkManager.getHealthyClient();
}

export async function executeContractCall<T>(
  operation: (client: PublicClient) => Promise<T>
): Promise<T> {
  return networkManager.executeWithRetry(operation);
}

// Enhanced gas estimation
export async function estimateGasWithFallback(
  client: PublicClient,
  request: Record<string, unknown>
): Promise<bigint> {
  try {
    // Try to estimate gas
    const estimatedGas = await client.estimateGas(request);
    // Add 20% buffer
    return (estimatedGas * 120n) / 100n;
  } catch (error) {
    console.warn('Gas estimation failed, using default:', error);
    return GAS_SETTINGS.gas;
  }
}

// Enhanced transaction options for wagmi compatibility
export function getTransactionOptions(useAutomaticGas = true) {
  if (useAutomaticGas) {
    // Let ethers handle gas estimation automatically
    return {};
  }
  
  return {
    gas: GAS_SETTINGS.gas,
    gasPrice: GAS_SETTINGS.gasPrice,
    // Note: maxFeePerGas and maxPriorityFeePerGas are not compatible with wagmi's current version
    // Using gasPrice for legacy compatibility
  };
}

// Network status monitoring
export function getNetworkStatus() {
  return {
    isHealthy: networkManager['isHealthy'],
    currentRpcIndex: networkManager['currentClientIndex'],
    totalRpcEndpoints: NETWORK_CONNECTION_CONFIG.rpcUrls.length,
  };
}

// Cleanup on app unmount
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    networkManager.destroy();
  });
}
