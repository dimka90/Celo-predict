/**
 * MiniPay Integration Hook
 * 
 * MiniPay is a lightweight, non-custodial stablecoin wallet built on Celo
 * that enables seamless, low-cost in-app transactions using phone numbers.
 * 
 * Documentation: https://docs.celo.org/build-on-celo/build-on-minipay/code-library
 * Documentation: https://docs.celo.org/build-on-celo/build-on-minipay/deeplinks
 */

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useChainId } from 'wagmi';
import {
  MINIPAY_CONFIG,
  MINIPAY_DEEPLINKS,
  MINIPAY_TRANSACTIONS,
  MiniPayTransactionRequest,
  MiniPayPaymentRequest,
} from '@/config/minipay';

export interface MiniPayUser {
  address: string;
  isConnected: boolean;
}

export interface MiniPayReward {
  amount: string;
  currency: 'cUSD' | 'cEUR' | 'CELO';
  recipient: string;
  message?: string;
}

/**
 * Hook to detect and interact with MiniPay
 * Uses official MiniPay SDK methods per Celo documentation
 */
export function useMiniPay() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [miniPayUser, setMiniPayUser] = useState<MiniPayUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect MiniPay environment on mount
  useEffect(() => {
    const detected = MINIPAY_CONFIG.isInMiniPayBrowser();
    setIsMiniPay(detected);

    if (detected && isConnected && address) {
      setMiniPayUser({
        address,
        isConnected: true,
      });
    }
  }, [isConnected, address]);

  /**
   * Send transaction via MiniPay using official SDK
   */
  const sendTransaction = useCallback(
    async (tx: MiniPayTransactionRequest): Promise<string> => {
      if (!isMiniPay) {
        throw new Error('MiniPay is not available in this environment');
      }

      setIsLoading(true);
      setError(null);

      try {
        const txHash = await MINIPAY_TRANSACTIONS.sendTransaction(tx);
        return txHash;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isMiniPay]
  );

  /**
   * Sign message via MiniPay
   */
  const signMessage = useCallback(
    async (message: string): Promise<string> => {
      if (!isMiniPay || !address) {
        throw new Error('MiniPay is not available or address not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const signature = await MINIPAY_TRANSACTIONS.signMessage(message, address);
        return signature;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isMiniPay, address]
  );

  /**
   * Send a payment via MiniPay deep link
   */
  const sendPaymentViaDeepLink = useCallback(
    (payment: MiniPayPaymentRequest): void => {
      const deepLink = MINIPAY_DEEPLINKS.generatePaymentLink(payment);
      MINIPAY_DEEPLINKS.openDeepLink(deepLink);
    },
    []
  );

  /**
   * Send transaction via deep link
   */
  const sendTransactionViaDeepLink = useCallback(
    (tx: MiniPayTransactionRequest): void => {
      const deepLink = MINIPAY_DEEPLINKS.generateTransactionLink(tx);
      MINIPAY_DEEPLINKS.openDeepLink(deepLink);
    },
    []
  );

  /**
   * Check if user can receive rewards via MiniPay
   */
  const canReceiveRewards = useCallback((): boolean => {
    return isMiniPay && isConnected;
  }, [isMiniPay, isConnected]);

  /**
   * Get MiniPay-specific transaction options
   */
  const getMiniPayTransactionOptions = useCallback(
    () => ({
      gas: '5000000', // 5M gas (optimized for MiniPay)
      gasPrice: '500000000', // 0.5 gwei (Celo optimized)
      chainId: 42220, // Celo mainnet
    }),
    []
  );

  return {
    // State
    isMiniPay,
    miniPayUser,
    isLoading,
    error,
    canReceiveRewards: canReceiveRewards(),

    // Actions
    sendTransaction,
    signMessage,
    sendPaymentViaDeepLink,
    sendTransactionViaDeepLink,
    getMiniPayTransactionOptions,
  };
}

/**
 * Hook for MiniPay-specific reward distribution
 * Useful for in-app rewards, predictions payouts, etc.
 */
export function useMiniPayRewards() {
  const {
    sendTransaction,
    isMiniPay,
    canReceiveRewards,
    isLoading,
    error,
  } = useMiniPay();
  const { address } = useAccount();
  const [pendingRewards, setPendingRewards] = useState<MiniPayReward[]>([]);

  /**
   * Send prediction winnings via MiniPay transaction
   */
  const sendPredictionWinnings = useCallback(
    async (
      recipient: string,
      amount: string,
      contractAddress: string,
      encodedData: string,
      currency: 'cUSD' | 'cEUR' | 'CELO' = 'cUSD'
    ): Promise<string> => {
      if (!address) throw new Error('No address connected');

      const tx: MiniPayTransactionRequest = {
        to: contractAddress,
        from: address,
        value: currency === 'CELO' ? amount : '0',
        data: encodedData,
        chainId: 42220,
      };

      return sendTransaction(tx);
    },
    [address, sendTransaction]
  );

  /**
   * Send payment via deep link (phone-based routing)
   */
  const sendPaymentViaPhone = useCallback(
    (phoneNumber: string, amount: string, currency: 'cUSD' | 'cEUR' | 'CELO' = 'cUSD'): void => {
      const payment: MiniPayPaymentRequest = {
        address: '', // Will be resolved by MiniPay from phone number
        amount,
        token: currency,
        phoneNumber,
        comment: 'Prediction winnings from Predinex',
      };

      const deepLink = MINIPAY_DEEPLINKS.generatePaymentLink(payment);
      MINIPAY_DEEPLINKS.openDeepLink(deepLink);
    },
    []
  );

  /**
   * Distribute rewards to multiple users
   */
  const distributeRewards = useCallback(
    async (
      rewards: Array<{
        recipient: string;
        amount: string;
        contractAddress: string;
        encodedData: string;
      }>
    ): Promise<{ success: number; failed: number }> => {
      if (!isMiniPay) {
        throw new Error('MiniPay is not available');
      }

      let success = 0;
      let failed = 0;

      for (const reward of rewards) {
        try {
          await sendPredictionWinnings(
            reward.recipient,
            reward.amount,
            reward.contractAddress,
            reward.encodedData
          );
          success++;
        } catch (err) {
          console.error('Failed to send reward:', err);
          failed++;
        }
      }

      return { success, failed };
    },
    [isMiniPay, sendPredictionWinnings]
  );

  return {
    distributeRewards,
    sendPredictionWinnings,
    sendPaymentViaPhone,
    canReceiveRewards,
    pendingRewards,
    isLoading,
    error,
  };
}

