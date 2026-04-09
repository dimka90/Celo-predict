# CeloPredict Deployment Information

This document contains the verified contract addresses and deployment instructions for CeloPredict.

## Celo Sepolia (Testnet) - Chain ID: 11142220

These contracts are currently used for testing and are linked to the live staging environment.

| Contract | Address |
| --- | --- |
| **SimplePoolCreator** (Active) | `0x0be72f399156a07dafeb741c95d7998c16c0e4ba` |
| **PredinexToken** (PRIX) | `0xba49b00e23ab11aabacc3ed5f6e9ea05bc58cd3e` |
| **PredinexPoolCore** (Full) | `0x218d0e387b5f768ee681219be425befd56604dbe` |
| **PredinexPoolFactory** | `0x5c2eaedb9f0cc9bce87360a38da0ae7e136dddd5` |

---

## Celo Mainnet - Chain ID: 42220

To meet the **Proof of Ship** requirements, you must deploy these contracts to Celo Mainnet.

### 1. Preparation
Ensure you have your private key exported as an environment variable:
```bash
export PRIVATE_KEY=your_private_key_here
```

### 2. Deployment Command
Run the following command to deploy the full ecosystem to Celo Mainnet:

```bash
forge script script/Deploy.s.sol:Deploy --rpc-url https://forno.celo.org --broadcast --legacy
```

*Note: The `--legacy` flag is often required for Celo to handle gas properly if using older Foundry versions.*

### 3. Verification
After deployment, update your `.env` or `config/wagmi.ts` with the new addresses:
- `NEXT_PUBLIC_POOL_CORE_ADDRESS`
- `NEXT_PUBLIC_PRIX_TOKEN_ADDRESS`
- `NEXT_PUBLIC_FACTORY_ADDRESS`

---

## MiniPay Integration Status
The app is **MiniPay Compatible**. It includes:
1.  **Detection**: Automatically detects MiniPay browser/provider.
2.  **Hooks**: `useMiniPay` and `useMiniPayRewards` for seamless transactions.
3.  **UI**: "MiniPay Ready" badge visible in mobile view.
