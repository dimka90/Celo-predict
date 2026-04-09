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

### 2. Wallet Funding
The deployment script estimated a requirement of **~0.39 CELO** for the full ecosystem. 
Your derived wallet address is: `0x86E74256beC87d5f542BC9214b708A9dE78e3998`

Please ensure this address has at least **0.5 CELO** for a smooth deployment.

---

### 3. Deployment Options

#### Option A: Full Ecosystem (Recommended)
This deploys all core contracts (Token, PoolCore, Factory, etc.).
```bash
forge script script/Deploy.s.sol:Deploy --rpc-url https://forno.celo.org --broadcast --legacy
```

#### Option B: Simple Deployment (Lower Gas)
If you are low on CELO, you can deploy just the PRIX token and Simple Pool Creator.
```bash
forge script scripts/DeploySimplePool.s.sol:DeploySimplePool --rpc-url https://forno.celo.org --broadcast --legacy
```

---

### 4. Post-Deployment Configuration
After deployment, update your `config/wagmi.ts` with the new addresses:
- **Pool Core / Pool Creator**: Update `CONTRACT_ADDRESSES.POOL_CORE`
- **PRIX Token**: Update `CONTRACT_ADDRESSES.PRIX_TOKEN`

---

### 5. Interaction Gas Costs
Once deployed, interacting with the contracts (e.g., creating pools, placing bets) is **extremely cheap** on Celo:
- **Deployment**: ~0.39 CELO (One-time cost to create contracts)
- **Interaction (e.g., Create Pool)**: ~0.02 - 0.03 CELO (Approx. $0.02 USD)
- **Betting/Settlement**: < 0.01 CELO (Approx. $0.01 USD)

Celo's low fees make it ideal for high-frequency prediction markets and automated scripts.

## MiniPay Integration Status
The app is **MiniPay Compatible**. It includes:
1.  **Detection**: Automatically detects MiniPay browser/provider.
2.  **Hooks**: `useMiniPay` and `useMiniPayRewards` for seamless transactions.
3.  **UI**: "MiniPay Ready" badge visible in mobile view.
