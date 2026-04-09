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
Ensure you have your environment variables set:
```bash
# Your wallet private key (must have CELO for gas)
export PRIVATE_KEY=your_private_key_here

# Optional: For contract verification on CeloScan/Explorer
# Get this from https://celoscan.io/
export CELOSCAN_API_KEY=your_api_key_here
```

### 2. Deployment & Verification Command
Run the following command to deploy and and verify the ecosystem on Celo Mainnet:

```bash
forge script script/Deploy.s.sol:Deploy --rpc-url https://forno.celo.org --broadcast --verify --legacy
```

**Why Verify?**
Contracts verified on the Explorer are essential for the "Proof of Ship" application as they allow judges to audit the project's logic directly.

### 3. Verification Troubleshooting
If verification fails during deployment, you can verify manually:
```bash
forge verify-contract <CONTRACT_ADDRESS> <CONTRACT_NAME> --chain 42220 --watch
```

### 4. Post-Deployment Configuration
After deployment, update your `config/wagmi.ts` with the new addresses:
- **Pool Core**: Update `CONTRACT_ADDRESSES.POOL_CORE`
- **PRIX Token**: Update `CONTRACT_ADDRESSES.PRIX_TOKEN`
- **Factory**: Update `CONTRACT_ADDRESSES.FACTORY`

---

## MiniPay Integration Status
The app is **MiniPay Compatible**. It includes:
1.  **Detection**: Automatically detects MiniPay browser/provider.
2.  **Hooks**: `useMiniPay` and `useMiniPayRewards` for seamless transactions.
3.  **UI**: "MiniPay Ready" badge visible in mobile view.
