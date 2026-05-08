# MiniPay Integration Guide (Updated)

## Overview

This document describes the updated MiniPay integration that now fully complies with the official Celo MiniPay documentation:
- [Code Library Reference](https://docs.celo.org/build-on-celo/build-on-minipay/code-library)
- [Deep Links Reference](https://docs.celo.org/build-on-celo/build-on-minipay/deeplinks)

## What's New

### 1. Official SDK Integration
- Uses proper MiniPay provider detection via `window.ethereum`
- Implements official transaction request format per Celo spec
- Proper error handling for MiniPay-specific errors
- Session management and chain ID verification

### 2. Deep Link Support
- Payment deep links: `celo://pay?address=...&amount=...&token=...`
- Transaction deep links: `celo://tx?to=...&from=...&value=...&data=...`
- QR code generation for deep links
- Phone-based payment routing

### 3. Transaction Request Format
Follows the official MiniPay transaction spec:
```typescript
{
  to: string;           // Contract address
  from: string;         // User address
  value?: string;       // Amount in wei
  data?: string;        // Encoded function call
  gas?: string;         // Gas limit
  gasPrice?: string;    // Gas price
  chainId: number;      // 42220 for Celo mainnet
  nonce?: number;       // Transaction nonce
}
```

### 4. QR Code Handling
- Generate QR codes for payments and transactions
- Share QR codes via native share API
- Copy deep links to clipboard
- Scan QR codes to trigger MiniPay actions

### 5. Phone-Based Payment Routing
- Send payments to phone numbers
- MiniPay resolves phone number to address
- Useful for user-to-user payments

## File Structure

```
config/
  └── minipay.ts                    # Core MiniPay configuration and SDK
utils/
  └── minipayDeepLinks.ts           # Deep link utilities and helpers
hooks/
  └── useMiniPay.ts                 # React hooks for MiniPay integration
components/
  ├── MiniPayDeepLinkHandler.tsx    # Handles incoming deep links
  └── MiniPayQRCode.tsx             # QR code display component
docs/
  └── MINIPAY_INTEGRATION_UPDATED.md # This file
```

## Usage Examples

### 1. Detect MiniPay Environment

```typescript
import { MINIPAY_CONFIG } from '@/config/minipay';

// Check if running in MiniPay browser
if (MINIPAY_CONFIG.isInMiniPayBrowser()) {
  console.log('Running in MiniPay browser');
}

// Get MiniPay provider
const provider = MINIPAY_CONFIG.getMiniPayProvider();
```

### 2. Send Transaction via MiniPay

```typescript
import { useMiniPay } from '@/hooks/useMiniPay';

function MyComponent() {
  const { sendTransaction, isMiniPay } = useMiniPay();

  const handleTransaction = async () => {
    try {
      const txHash = await sendTransaction({
        to: '0x1234567890123456789012345678901234567890',
        from: userAddress,
        value: '1000000000000000000', // 1 CELO in wei
        data: '0x', // No data for simple transfer
        chainId: 42220,
      });

      console.log('Transaction sent:', txHash);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <button onClick={handleTransaction} disabled={!isMiniPay}>
      Send Transaction
    </button>
  );
}
```

### 3. Send Payment via Deep Link

```typescript
import { useMiniPay } from '@/hooks/useMiniPay';

function PaymentComponent() {
  const { sendPaymentViaDeepLink } = useMiniPay();

  const handlePayment = () => {
    sendPaymentViaDeepLink({
      address: '0x1234567890123456789012345678901234567890',
      amount: '10',
      token: 'cUSD',
      comment: 'Payment for prediction winnings',
    });
  };

  return <button onClick={handlePayment}>Send Payment</button>;
}
```

### 4. Send Payment via Phone Number

```typescript
import { useMiniPayRewards } from '@/hooks/useMiniPay';

function PhonePaymentComponent() {
  const { sendPaymentViaPhone } = useMiniPayRewards();

  const handlePhonePayment = () => {
    sendPaymentViaPhone('+1234567890', '10', 'cUSD');
  };

  return <button onClick={handlePhonePayment}>Send via Phone</button>;
}
```

### 5. Display QR Code for Payment

```typescript
import { MiniPayQRCode } from '@/components/MiniPayQRCode';

function QRCodeComponent() {
  return (
    <MiniPayQRCode
      payment={{
        address: '0x1234567890123456789012345678901234567890',
        amount: '10',
        token: 'cUSD',
        comment: 'Prediction winnings',
      }}
      size={256}
      showCopyButton
      showShareButton
    />
  );
}
```

### 6. Handle Incoming Deep Links

```typescript
import { MiniPayDeepLinkHandler } from '@/components/MiniPayDeepLinkHandler';
import { MiniPayPaymentRequest, MiniPayTransactionRequest } from '@/config/minipay';

function AppComponent() {
  const handlePaymentRequest = (request: MiniPayPaymentRequest) => {
    console.log('Payment request:', request);
    // Process payment request
  };

  const handleTransactionRequest = (request: MiniPayTransactionRequest) => {
    console.log('Transaction request:', request);
    // Process transaction request
  };

  return (
    <>
      <MiniPayDeepLinkHandler
        onPaymentRequest={handlePaymentRequest}
        onTransactionRequest={handleTransactionRequest}
      />
      {/* Rest of app */}
    </>
  );
}
```

### 7. Sign Message via MiniPay

```typescript
import { useMiniPay } from '@/hooks/useMiniPay';

function SignMessageComponent() {
  const { signMessage } = useMiniPay();

  const handleSign = async () => {
    try {
      const signature = await signMessage('Hello, MiniPay!');
      console.log('Signature:', signature);
    } catch (error) {
      console.error('Sign failed:', error);
    }
  };

  return <button onClick={handleSign}>Sign Message</button>;
}
```

## Deep Link Format

### Payment Deep Link
```
celo://pay?address=0x...&amount=10&token=cUSD&comment=Payment
```

Parameters:
- `address`: Recipient address (required)
- `amount`: Amount to send (required)
- `token`: Currency - `cUSD`, `cEUR`, or `CELO` (optional, default: cUSD)
- `comment`: Payment comment (optional)
- `phoneNumber`: Recipient phone number (optional, alternative to address)

### Transaction Deep Link
```
celo://tx?to=0x...&from=0x...&value=1000000000000000000&data=0x&chainId=42220
```

Parameters:
- `to`: Contract address (required)
- `from`: User address (required)
- `value`: Amount in wei (optional, default: 0)
- `data`: Encoded function call (optional)
- `gas`: Gas limit (optional)
- `chainId`: Chain ID (required)

## API Reference

### MINIPAY_CONFIG

```typescript
// Detection
MINIPAY_CONFIG.isMiniPayAvailable(): boolean
MINIPAY_CONFIG.isInMiniPayBrowser(): boolean
MINIPAY_CONFIG.getMiniPayProvider(): MiniPayProvider | null

// Account management
MINIPAY_CONFIG.requestAccount(): Promise<string>
MINIPAY_CONFIG.getChainId(): Promise<number>
```

### MINIPAY_DEEPLINKS

```typescript
// Generate links
MINIPAY_DEEPLINKS.generatePaymentLink(request): string
MINIPAY_DEEPLINKS.generateTransactionLink(tx): string
MINIPAY_DEEPLINKS.generateQRLink(data): string

// Handle links
MINIPAY_DEEPLINKS.openDeepLink(link): void
MINIPAY_DEEPLINKS.handleDeepLink(url): MiniPayPaymentRequest | MiniPayTransactionRequest | null
```

### MINIPAY_TRANSACTIONS

```typescript
// Send transaction
MINIPAY_TRANSACTIONS.sendTransaction(tx): Promise<string>

// Sign message
MINIPAY_TRANSACTIONS.signMessage(message, address): Promise<string>

// Get receipt
MINIPAY_TRANSACTIONS.getTransactionReceipt(txHash): Promise<any>
```

### useMiniPay Hook

```typescript
const {
  isMiniPay,                    // Is running in MiniPay
  miniPayUser,                  // Connected user info
  isLoading,                    // Loading state
  error,                        // Error message
  canReceiveRewards,            // Can receive rewards
  sendTransaction,              // Send transaction
  signMessage,                  // Sign message
  sendPaymentViaDeepLink,       // Send payment via deep link
  sendTransactionViaDeepLink,   // Send transaction via deep link
  getMiniPayTransactionOptions, // Get optimized gas settings
} = useMiniPay();
```

### useMiniPayRewards Hook

```typescript
const {
  distributeRewards,      // Distribute to multiple users
  sendPredictionWinnings, // Send winnings
  sendPaymentViaPhone,    // Send via phone number
  canReceiveRewards,      // Can receive rewards
  pendingRewards,         // Pending rewards list
  isLoading,              // Loading state
  error,                  // Error message
} = useMiniPayRewards();
```

## Best Practices

### 1. Transaction Optimization
```typescript
// Use optimized gas settings for MiniPay
const options = getMiniPayTransactionOptions();
// Returns: { gas: '5000000', gasPrice: '500000000', chainId: 42220 }
```

### 2. Error Handling
```typescript
try {
  await sendTransaction(tx);
} catch (error) {
  if (error.message.includes('MiniPay')) {
    // Handle MiniPay-specific error
  } else {
    // Handle general error
  }
}
```

### 3. Mobile Optimization
- Use touch-friendly button sizes (min 44px)
- Avoid horizontal scroll
- Use readable text (min 16px)
- Optimize for slow networks

### 4. Deep Link Handling
```typescript
// Always check if deep link is valid before processing
const request = MINIPAY_DEEPLINKS.handleDeepLink(url);
if (request) {
  // Process request
}
```

### 5. QR Code Generation
```typescript
// Use a proper QR code library in production
// Recommended: qrcode.react or qr-code-styling
import QRCode from 'qrcode.react';

<QRCode value={deepLink} size={256} />;
```

## Testing

### Desktop Testing
```typescript
// Simulate MiniPay in browser console
window.ethereum = {
  isMiniPay: true,
  request: async (args) => {
    console.log('MiniPay request:', args);
    return '0x...'; // Mock response
  },
};
```

### Mobile Testing
1. Install Celo app with MiniPay
2. Open MiniPay browser
3. Navigate to your app
4. Test wallet connection and transactions

### Deep Link Testing
```typescript
// Test payment deep link
const link = MINIPAY_DEEPLINKS.generatePaymentLink({
  address: '0x...',
  amount: '10',
  token: 'cUSD',
});
console.log(link); // celo://pay?address=0x...&amount=10&token=cUSD
```

## Troubleshooting

### Issue: MiniPay not detected
**Solution:**
1. Verify you're in MiniPay browser
2. Check `MINIPAY_CONFIG.isInMiniPayBrowser()`
3. Verify `window.ethereum` is available
4. Check browser console for errors

### Issue: Transaction fails
**Solution:**
1. Verify chain ID is 42220 (Celo mainnet)
2. Check gas settings are correct
3. Verify user has sufficient balance
4. Check transaction data is properly encoded

### Issue: Deep link not working
**Solution:**
1. Verify deep link format is correct
2. Check URL encoding
3. Verify parameters are valid
4. Test with `MINIPAY_DEEPLINKS.handleDeepLink()`

### Issue: QR code not displaying
**Solution:**
1. Install qrcode library: `npm install qrcode.react`
2. Verify canvas element is available
3. Check browser console for errors
4. Verify deep link is valid

## Migration from Old Integration

If you're upgrading from the old MiniPay integration:

### Old Way
```typescript
// Old: Manual provider detection
const provider = window.ethereum;
if (provider?.isMiniPay) {
  // Send transaction manually
}
```

### New Way
```typescript
// New: Use official SDK
import { useMiniPay } from '@/hooks/useMiniPay';

const { sendTransaction } = useMiniPay();
await sendTransaction(tx);
```

## Resources

- [Celo MiniPay Code Library](https://docs.celo.org/build-on-celo/build-on-minipay/code-library)
- [Celo MiniPay Deep Links](https://docs.celo.org/build-on-celo/build-on-minipay/deeplinks)
- [Celo Documentation](https://docs.celo.org)
- [Celo Explorer](https://explorer.celo.org)

## Support

For issues or questions:
1. Check the [Celo Documentation](https://docs.celo.org)
2. Review the [API Reference](#api-reference)
3. Check the [Troubleshooting](#troubleshooting) section
4. Join the [Celo Discord](https://discord.gg/celo)

---

**Last Updated:** November 28, 2025
**Status:** ✅ Updated to match official Celo MiniPay documentation
