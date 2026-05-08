/**
 * MiniPay Integration Configuration
 * Reference: https://docs.celo.org/build-on-celo/build-on-minipay/code-library
 * Reference: https://docs.celo.org/build-on-celo/build-on-minipay/deeplinks
 * 
 * MiniPay is a mobile wallet built into the Celo app.
 * It works through the injected ethereum provider (window.ethereum).
 * When users open Predinex in the MiniPay browser, they can connect directly.
 */

// MiniPay Provider Interface
export interface MiniPayProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
  isMiniPay?: boolean;
  isCelo?: boolean;
}

// MiniPay Transaction Request
export interface MiniPayTransactionRequest {
  to: string;
  from: string;
  value?: string;
  data?: string;
  gas?: string;
  gasPrice?: string;
  chainId: number;
  nonce?: number;
}

// MiniPay Payment Request
export interface MiniPayPaymentRequest {
  address: string;
  amount: string;
  token?: 'cUSD' | 'cEUR' | 'CELO';
  comment?: string;
  phoneNumber?: string;
}

// MiniPay Detection
export const MINIPAY_CONFIG = {
  // Check if MiniPay provider is available
  isMiniPayAvailable: (): boolean => {
    if (typeof window === 'undefined') return false;
    const ethereum = (window as any).ethereum as MiniPayProvider | undefined;
    return !!(ethereum && (ethereum.isMiniPay || ethereum.isCelo));
  },

  // Check if running in MiniPay browser
  isInMiniPayBrowser: (): boolean => {
    if (typeof window === 'undefined') return false;
    const userAgent = navigator.userAgent.toLowerCase();
    const isMiniPayUA = userAgent.includes('minipay') || userAgent.includes('celo');
    const isMiniPayProvider = (window as any).ethereum?.isMiniPay || (window as any).ethereum?.isCelo;
    return isMiniPayUA || isMiniPayProvider;
  },

  // Get MiniPay provider
  getMiniPayProvider: (): MiniPayProvider | null => {
    if (typeof window === 'undefined') return null;
    const ethereum = (window as any).ethereum as MiniPayProvider | undefined;
    if (ethereum && (ethereum.isMiniPay || ethereum.isCelo)) {
      return ethereum;
    }
    return null;
  },

  // Request MiniPay account
  requestAccount: async (): Promise<string> => {
    const provider = MINIPAY_CONFIG.getMiniPayProvider();
    if (!provider) throw new Error('MiniPay not available');
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      return accounts[0];
    } catch (error) {
      console.error('MiniPay account request failed:', error);
      throw error;
    }
  },

  // Get current chain ID
  getChainId: async (): Promise<number> => {
    const provider = MINIPAY_CONFIG.getMiniPayProvider();
    if (!provider) throw new Error('MiniPay not available');
    try {
      const chainId = await provider.request({ method: 'eth_chainId' });
      return parseInt(chainId, 16);
    } catch (error) {
      console.error('Failed to get chain ID:', error);
      throw error;
    }
  },
};

// MiniPay Deep Links
export const MINIPAY_DEEPLINKS = {
  // Generate payment deep link
  generatePaymentLink: (request: MiniPayPaymentRequest): string => {
    const params = new URLSearchParams({
      address: request.address,
      amount: request.amount,
      ...(request.token && { token: request.token }),
      ...(request.comment && { comment: request.comment }),
      ...(request.phoneNumber && { phoneNumber: request.phoneNumber }),
    });
    return `celo://pay?${params.toString()}`;
  },

  // Generate transaction deep link
  generateTransactionLink: (tx: MiniPayTransactionRequest): string => {
    const params = new URLSearchParams({
      to: tx.to,
      from: tx.from,
      value: tx.value || '0',
      ...(tx.data && { data: tx.data }),
      ...(tx.gas && { gas: tx.gas }),
      chainId: tx.chainId.toString(),
    });
    return `celo://tx?${params.toString()}`;
  },

  // Generate QR code deep link
  generateQRLink: (data: string): string => {
    return `celo://qr?data=${encodeURIComponent(data)}`;
  },

  // Open deep link
  openDeepLink: (link: string): void => {
    if (typeof window === 'undefined') return;
    window.location.href = link;
  },

  // Handle deep link from URL
  handleDeepLink: (url: string): MiniPayPaymentRequest | MiniPayTransactionRequest | null => {
    try {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol;

      if (protocol === 'celo:') {
        const pathname = urlObj.pathname;
        const params = Object.fromEntries(urlObj.searchParams);

        if (pathname === '//pay') {
          return {
            address: params.address,
            amount: params.amount,
            token: (params.token as 'cUSD' | 'cEUR' | 'CELO') || 'cUSD',
            comment: params.comment,
            phoneNumber: params.phoneNumber,
          } as MiniPayPaymentRequest;
        }

        if (pathname === '//tx') {
          return {
            to: params.to,
            from: params.from,
            value: params.value,
            data: params.data,
            gas: params.gas,
            chainId: parseInt(params.chainId, 10),
          } as MiniPayTransactionRequest;
        }
      }
    } catch (error) {
      console.error('Failed to parse deep link:', error);
    }

    return null;
  },
};

// MiniPay Transaction Requests (per spec)
export const MINIPAY_TRANSACTIONS = {
  // Send transaction via MiniPay
  sendTransaction: async (tx: MiniPayTransactionRequest): Promise<string> => {
    const provider = MINIPAY_CONFIG.getMiniPayProvider();
    if (!provider) throw new Error('MiniPay not available');

    try {
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            to: tx.to,
            from: tx.from,
            value: tx.value || '0x0',
            data: tx.data,
            gas: tx.gas ? `0x${parseInt(tx.gas).toString(16)}` : undefined,
            gasPrice: tx.gasPrice ? `0x${parseInt(tx.gasPrice).toString(16)}` : undefined,
            chainId: `0x${tx.chainId.toString(16)}`,
            nonce: tx.nonce ? `0x${tx.nonce.toString(16)}` : undefined,
          },
        ],
      });

      return txHash;
    } catch (error) {
      console.error('MiniPay transaction failed:', error);
      throw error;
    }
  },

  // Sign message via MiniPay
  signMessage: async (message: string, address: string): Promise<string> => {
    const provider = MINIPAY_CONFIG.getMiniPayProvider();
    if (!provider) throw new Error('MiniPay not available');

    try {
      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, address],
      });

      return signature;
    } catch (error) {
      console.error('MiniPay sign failed:', error);
      throw error;
    }
  },

  // Get transaction receipt
  getTransactionReceipt: async (txHash: string): Promise<any> => {
    const provider = MINIPAY_CONFIG.getMiniPayProvider();
    if (!provider) throw new Error('MiniPay not available');

    try {
      const receipt = await provider.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      });

      return receipt;
    } catch (error) {
      console.error('Failed to get transaction receipt:', error);
      throw error;
    }
  },
};

// MiniPay-specific optimizations
export const MINIPAY_OPTIMIZATIONS = {
  // Reduce animation complexity for mobile
  reduceMotion: true,

  // Optimize for mobile screen sizes
  mobileOptimized: true,

  // Fast transaction confirmation
  fastConfirmation: true,

  // Mobile-friendly gas settings (Celo optimized)
  gasSettings: {
    // Lower gas limits for faster confirmation
    gasLimit: BigInt(5000000), // 5M gas (lower than desktop)
    gasPrice: BigInt(500000000), // 0.5 gwei (Celo optimized)
  },
};

// MiniPay-specific features
export const MINIPAY_FEATURES = {
  // Enable one-click transactions
  oneClickTransactions: true,

  // Enable biometric authentication
  biometricAuth: true,

  // Enable QR code scanning
  qrCodeScanning: true,

  // Enable phone number verification
  phoneVerification: true,

  // Enable SMS notifications
  smsNotifications: true,

  // Enable deep links
  deepLinks: true,

  // Enable phone-based payment routing
  phonePaymentRouting: true,
};

// MiniPay UI customization
export const MINIPAY_UI = {
  // Use system fonts for better performance
  useSystemFonts: true,

  // Optimize button sizes for touch
  touchOptimizedButtons: true,

  // Reduce padding/margins for mobile
  compactLayout: true,
};

// MiniPay transaction optimization
export const optimizeForMiniPay = (config: any): any => {
  if (!MINIPAY_CONFIG.isInMiniPayBrowser()) {
    return config;
  }

  return {
    ...config,
    // Reduce gas for faster confirmation
    gas: MINIPAY_OPTIMIZATIONS.gasSettings.gasLimit,
    gasPrice: MINIPAY_OPTIMIZATIONS.gasSettings.gasPrice,

    // Enable fast confirmation
    fastConfirmation: MINIPAY_OPTIMIZATIONS.fastConfirmation,
  };
};
