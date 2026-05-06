/**
 * MiniPay Deep Link Utilities
 * Reference: https://docs.celo.org/build-on-celo/build-on-minipay/deeplinks
 * 
 * Utilities for generating and handling MiniPay deep links
 * including QR codes, payment requests, and transaction requests.
 */

import { MINIPAY_DEEPLINKS } from '@/config/minipay';
import type { MiniPayPaymentRequest, MiniPayTransactionRequest } from '@/config/minipay';

/**
 * Generate a QR code data URL for a MiniPay payment
 */
export function generatePaymentQRCode(payment: MiniPayPaymentRequest): string {
  const deepLink = MINIPAY_DEEPLINKS.generatePaymentLink(payment);
  // In production, use a QR code library like qrcode.react or qr-code-styling
  // For now, return the deep link that can be encoded
  return deepLink;
}

/**
 * Generate a QR code data URL for a MiniPay transaction
 */
export function generateTransactionQRCode(tx: MiniPayTransactionRequest): string {
  const deepLink = MINIPAY_DEEPLINKS.generateTransactionLink(tx);
  return deepLink;
}

/**
 * Create a shareable payment link
 */
export function createShareablePaymentLink(
  baseUrl: string,
  payment: MiniPayPaymentRequest
): string {
  const deepLink = MINIPAY_DEEPLINKS.generatePaymentLink(payment);
  const encoded = encodeURIComponent(deepLink);
  return `${baseUrl}?deeplink=${encoded}`;
}

/**
 * Create a shareable transaction link
 */
export function createShareableTransactionLink(
  baseUrl: string,
  tx: MiniPayTransactionRequest
): string {
  const deepLink = MINIPAY_DEEPLINKS.generateTransactionLink(tx);
  const encoded = encodeURIComponent(deepLink);
  return `${baseUrl}?deeplink=${encoded}`;
}

/**
 * Parse deep link from URL query parameters
 */
export function parseDeepLinkFromURL(): MiniPayPaymentRequest | MiniPayTransactionRequest | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const deeplink = params.get('deeplink');

  if (!deeplink) return null;

  try {
    const decodedLink = decodeURIComponent(deeplink);
    return MINIPAY_DEEPLINKS.handleDeepLink(decodedLink);
  } catch (error) {
    console.error('Failed to parse deep link:', error);
    return null;
  }
}

/**
 * Handle incoming deep link
 */
export function handleIncomingDeepLink(link: string): void {
  const request = MINIPAY_DEEPLINKS.handleDeepLink(link);

  if (!request) {
    console.warn('Invalid deep link:', link);
    return;
  }

  // Dispatch custom event for components to listen to
  const event = new CustomEvent('minipay-deeplink', { detail: request });
  window.dispatchEvent(event);
}

/**
 * Listen for deep link events
 */
export function onMiniPayDeepLink(
  callback: (request: MiniPayPaymentRequest | MiniPayTransactionRequest) => void
): () => void {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent;
    callback(customEvent.detail);
  };

  window.addEventListener('minipay-deeplink', handler);

  // Return unsubscribe function
  return () => {
    window.removeEventListener('minipay-deeplink', handler);
  };
}

/**
 * Generate payment request for prediction winnings
 */
export function generateWinningsPaymentRequest(
  recipientAddress: string,
  amount: string,
  currency: 'cUSD' | 'cEUR' | 'CELO' = 'cUSD'
): MiniPayPaymentRequest {
  return {
    address: recipientAddress,
    amount,
    token: currency,
    comment: 'Prediction winnings from Predinex',
  };
}

/**
 * Generate payment request for phone-based routing
 */
export function generatePhonePaymentRequest(
  phoneNumber: string,
  amount: string,
  currency: 'cUSD' | 'cEUR' | 'CELO' = 'cUSD'
): MiniPayPaymentRequest {
  return {
    address: '', // Will be resolved by MiniPay
    amount,
    token: currency,
    phoneNumber,
    comment: 'Payment from Predinex',
  };
}

/**
 * Generate transaction request for contract interaction
 */
export function generateContractTransactionRequest(
  contractAddress: string,
  userAddress: string,
  encodedData: string,
  value: string = '0'
): MiniPayTransactionRequest {
  return {
    to: contractAddress,
    from: userAddress,
    value,
    data: encodedData,
    chainId: 42220, // Celo mainnet
  };
}

/**
 * Copy deep link to clipboard
 */
export async function copyDeepLinkToClipboard(deepLink: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(deepLink);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Share deep link via native share API
 */
export async function shareDeepLink(
  title: string,
  text: string,
  deepLink: string
): Promise<boolean> {
  if (!navigator.share) {
    console.warn('Share API not available');
    return false;
  }

  try {
    await navigator.share({
      title,
      text,
      url: deepLink,
    });
    return true;
  } catch (error) {
    console.error('Failed to share:', error);
    return false;
  }
}
