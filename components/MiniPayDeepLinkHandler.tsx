/**
 * MiniPay Deep Link Handler Component
 * 
 * Handles incoming deep links from MiniPay and processes them
 * Supports payment requests, transaction requests, and QR codes
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  parseDeepLinkFromURL,
  onMiniPayDeepLink,
} from '@/utils/minipayDeepLinks';
import { MINIPAY_CONFIG } from '@/config/minipay';
import type { MiniPayPaymentRequest, MiniPayTransactionRequest } from '@/config/minipay';

interface MiniPayDeepLinkHandlerProps {
  onPaymentRequest?: (request: MiniPayPaymentRequest) => void;
  onTransactionRequest?: (request: MiniPayTransactionRequest) => void;
  onError?: (error: Error) => void;
}

export function MiniPayDeepLinkHandler({
  onPaymentRequest,
  onTransactionRequest,
  onError,
}: MiniPayDeepLinkHandlerProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check for deep link in URL on mount
    const deepLink = parseDeepLinkFromURL();

    if (deepLink) {
      setIsProcessing(true);

      try {
        if ('phoneNumber' in deepLink || 'address' in deepLink) {
          // Payment request
          onPaymentRequest?.(deepLink as MiniPayPaymentRequest);
        } else if ('to' in deepLink) {
          // Transaction request
          onTransactionRequest?.(deepLink as MiniPayTransactionRequest);
        }

        // Clean up URL
        router.replace(window.location.pathname);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        onError?.(err);
      } finally {
        setIsProcessing(false);
      }
    }

    // Listen for deep link events
    const unsubscribe = onMiniPayDeepLink((request) => {
      try {
        if ('phoneNumber' in request || 'address' in request) {
          onPaymentRequest?.(request as MiniPayPaymentRequest);
        } else if ('to' in request) {
          onTransactionRequest?.(request as MiniPayTransactionRequest);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        onError?.(err);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [router, onPaymentRequest, onTransactionRequest, onError]);

  if (!MINIPAY_CONFIG.isInMiniPayBrowser()) {
    return null;
  }

  if (isProcessing) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-700">Processing MiniPay request...</p>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Hook to handle MiniPay deep links
 */
export function useMiniPayDeepLink() {
  const [request, setRequest] = useState<MiniPayPaymentRequest | MiniPayTransactionRequest | null>(
    null
  );
  const [error, setError] = useState<Error | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check for deep link in URL
    const deepLink = parseDeepLinkFromURL();

    if (deepLink) {
      setIsProcessing(true);
      setRequest(deepLink);
      setIsProcessing(false);
    }

    // Listen for deep link events
    const unsubscribe = onMiniPayDeepLink((req) => {
      setRequest(req);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    request,
    error,
    isProcessing,
    isPaymentRequest: request && ('address' in request || 'phoneNumber' in request),
    isTransactionRequest: request && 'to' in request,
  };
}
