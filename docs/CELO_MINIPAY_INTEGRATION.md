# Celo MiniPay Integration Guide

This document outlines how Predinex integrates with Celo MiniPay for the Celo MiniPay Hackathon.

## Overview

Celo MiniPay is a mobile-first payment solution that enables seamless, low-cost transactions on the Celo blockchain. This integration allows Predinex users to:

- Make instant predictions with minimal transaction fees
- Access prediction markets directly from mobile devices
- Enjoy gasless transactions through MiniPay's innovative payment infrastructure
- Participate in the decentralized prediction market ecosystem on Celo

## Celo Network Configuration

### Mainnet (Production)
- **Chain ID**: 42220
- **RPC URL**: `https://forno.celo.org`
- **Explorer**: `https://explorer.celo.org`
- **Native Token**: CELO

### Alfajores Testnet (Development)
- **Chain ID**: 44787
- **RPC URL**: `https://alfajores-forno.celo.org`
- **Explorer**: `https://alfajores.celoscan.io`
- **Native Token**: CELO (testnet)

## MiniPay Integration Features

### 1. Wallet Connection
The app supports MiniPay wallet connections through:
- WalletConnect protocol
- Direct MiniPay app integration
- MetaMask (with Celo network support)

### 2. Transaction Optimization
- **Low Gas Fees**: Celo's proof-of-stake consensus enables significantly lower transaction costs
- **Fast Confirmations**: Average block time of ~5 seconds
- **Mobile-First**: Optimized for mobile wallet interactions

### 3. MiniPay-Specific Features
- **Simplified Onboarding**: Users can start predicting with minimal setup
- **Social Payments**: Leverage Celo's social payment features for pool creation
- **Stablecoin Support**: Native support for cUSD and cEUR stablecoins

## Implementation Details

### Network Configuration
The network configuration is automatically set based on environment:
- **Development**: Uses Alfajores testnet
- **Production**: Uses Celo mainnet

### Contract Deployment
All smart contracts need to be deployed to Celo. Update contract addresses in:
- `config/wagmi.ts` - `CONTRACT_ADDRESSES` object
- Environment variables for production deployment

### Gas Optimization
Celo-specific gas settings are configured in `config/wagmi.ts`:
```typescript
export const GAS_SETTINGS = {
  gas: BigInt(10000000),
  gasPrice: BigInt(1000000000), // 1 gwei (Celo optimized)
  maxFeePerGas: BigInt(2000000000),
  maxPriorityFeePerGas: BigInt(100000000),
}
```

## MiniPay SDK Integration (Future Enhancement)

To fully leverage MiniPay capabilities, consider integrating the MiniPay SDK:

```typescript
// Example MiniPay integration (pseudo-code)
import { MiniPay } from '@celo/minipay-sdk'

const minipay = new MiniPay({
  network: 'alfajores', // or 'mainnet'
})

// Connect to MiniPay
await minipay.connect()

// Send transaction
const tx = await minipay.sendTransaction({
  to: contractAddress,
  value: amount,
  data: encodedFunctionCall,
})
```

## Testing on Alfajores Testnet

1. Get testnet tokens from the [Celo Alfajores Faucet](https://faucet.celo.org/alfajores)
2. Connect your wallet to Alfajores testnet
3. Deploy contracts to testnet
4. Test all prediction market features

## Migration Checklist

- [x] Update network configuration to Celo
- [x] Update RPC endpoints
- [x] Update gas settings
- [x] Update network switching utilities
- [ ] Deploy contracts to Celo (Alfajores testnet first)
- [ ] Update contract addresses
- [ ] Test all features on testnet
- [ ] Integrate MiniPay SDK (optional)
- [ ] Deploy to Celo mainnet
- [ ] Update documentation

## Resources

- [Celo Documentation](https://docs.celo.org/)
- [Celo MiniPay](https://docs.celo.org/developer/minipay)
- [Celo Explorer](https://explorer.celo.org/)
- [Celo Alfajores Faucet](https://faucet.celo.org/alfajores)
- [Celo Developer Resources](https://docs.celo.org/developer)

## Hackathon Submission

For the Celo MiniPay Hackathon submission:

1. **Deploy contracts** to Celo Alfajores testnet
2. **Test all features** thoroughly
3. **Document MiniPay integration** in your submission
4. **Highlight mobile-first features** that leverage MiniPay
5. **Showcase prediction market innovation** on Celo

## Support

For issues or questions:
- Check [Celo Discord](https://discord.gg/celo)
- Review [Celo Forum](https://forum.celo.org/)
- Contact hackathon organizers

