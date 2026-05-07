/**
 * MiniPay QR Code Component
 * 
 * Displays QR codes for MiniPay payments and transactions
 * Allows users to scan with MiniPay browser to complete transactions
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import type { MiniPayPaymentRequest, MiniPayTransactionRequest } from '@/config/minipay';
import {
  generatePaymentQRCode,
  generateTransactionQRCode,
  copyDeepLinkToClipboard,
  shareDeepLink,
} from '@/utils/minipayDeepLinks';

interface MiniPayQRCodeProps {
  payment?: MiniPayPaymentRequest;
  transaction?: MiniPayTransactionRequest;
  size?: number;
  showCopyButton?: boolean;
  showShareButton?: boolean;
  onCopy?: () => void;
  onShare?: () => void;
}

export function MiniPayQRCode({
  payment,
  transaction,
  size = 256,
  showCopyButton = true,
  showShareButton = true,
  onCopy,
  onShare,
}: MiniPayQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [deepLink, setDeepLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      let link = '';

      if (payment) {
        link = generatePaymentQRCode(payment);
      } else if (transaction) {
        link = generateTransactionQRCode(transaction);
      }

      setDeepLink(link);

      // Generate QR code using canvas
      if (canvasRef.current && link) {
        generateQRCodeCanvas(canvasRef.current, link, size);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate QR code';
      setError(errorMsg);
    }
  }, [payment, transaction, size]);

  const handleCopy = async () => {
    try {
      const success = await copyDeepLinkToClipboard(deepLink);
      if (success) {
        setCopied(true);
        onCopy?.();
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    try {
      const title = payment ? 'MiniPay Payment Request' : 'MiniPay Transaction Request';
      const text = payment
        ? `Send ${payment.amount} ${payment.token || 'cUSD'} via MiniPay`
        : 'Complete this transaction via MiniPay';

      const success = await shareDeepLink(title, text, deepLink);
      if (success) {
        setShared(true);
        onShare?.();
        setTimeout(() => setShared(false), 2000);
      }
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Code Canvas */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="border border-gray-300 rounded"
        />
      </div>

      {/* Deep Link Display */}
      <div className="w-full max-w-sm">
        <p className="text-xs text-gray-500 mb-2">Deep Link:</p>
        <div className="bg-gray-50 p-2 rounded border border-gray-200 break-all text-xs font-mono">
          {deepLink}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 w-full max-w-sm">
        {showCopyButton && (
          <button
            onClick={handleCopy}
            className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {copied ? '✓ Copied' : 'Copy Link'}
          </button>
        )}

        {showShareButton && typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleShare}
            className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
              shared
                ? 'bg-green-500 text-white'
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            {shared ? '✓ Shared' : 'Share'}
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="w-full max-w-sm bg-blue-50 p-3 rounded border border-blue-200 text-sm text-blue-700">
        <p className="font-medium mb-1">📱 How to use:</p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Open MiniPay browser</li>
          <li>Scan this QR code</li>
          <li>Confirm the transaction</li>
          <li>Done!</li>
        </ol>
      </div>
    </div>
  );
}

/**
 * Generate QR code on canvas using a simple algorithm
 * For production, consider using a library like qrcode.react or qr-code-styling
 */
function generateQRCodeCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  size: number
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // For now, display a placeholder
  // In production, use a QR code library
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#000000';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw placeholder text
  ctx.fillText('QR Code', size / 2, size / 2 - 10);
  ctx.font = '10px Arial';
  ctx.fillText('(Install qrcode library)', size / 2, size / 2 + 10);

  // Draw border
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, size, size);
}

/**
 * Hook to generate QR code data
 */
export function useMiniPayQRCode(
  payment?: MiniPayPaymentRequest,
  transaction?: MiniPayTransactionRequest
) {
  const [qrData, setQrData] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      let data = '';

      if (payment) {
        data = generatePaymentQRCode(payment);
      } else if (transaction) {
        data = generateTransactionQRCode(transaction);
      }

      setQrData(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate QR code';
      setError(errorMsg);
    }
  }, [payment, transaction]);

  return { qrData, error };
}
