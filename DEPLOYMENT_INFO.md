## Celo Mainnet - Chain ID: 42220 (FINAL DEPLOYMENT)

The protocol is now live on Celo Mainnet. Use these addresses for your "Proof of Ship" application and frontend configuration.

| Contract | Address |
| --- | --- |
| **PoolCore** (Main Logic) | `0xE280fcf3E77ce302e78EB9a7CAb11D18bA4a4Da6` |
| **Factory** | `0x9c06E3f414e8A84f2255efC5983d2e669A2A7572` |
| **PRIX Token** | `0x36489A2cB87fB0ca8E9d0fE2350D082b90FDC68E` |
| **Reputation System** | `0x7E6a2344f250d35EcB8EF5EBF2EEd7Cf73375999` |
| **Boost System** | `0x8dFb57a5e43726645385c5E3E0C0a0505917eDA4` |
| **Staking Contract** | `0x35B4CbEd92d47DacfB4001423a9D065054362496` |
| **Combo Pools** | `0xea70f827C8d130BB5163ae251A598a96937cFD48` |
| **Guided Oracle** | `0xE796e9Da17d83dDf0576A50c5AD9434eD1dA96F3` |
| **Optimistic Oracle** | `0x2E58C87A0A0121a18EcC31eac34F3DCdBc25949e` |

---

## Celo Sepolia (Testnet) - Chain ID: 11142220

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

---

### 3. Deployment Options

#### Option A: Unified Deployment & Verification (Recommended)
This command deploys and verifies all contracts in one step on Celoscan, using your preferred format:

```bash
forge script script/Deploy.s.sol:Deploy --rpc-url https://forno.celo.org --private-key $PRIVATE_KEY --broadcast --verify --verifier etherscan --etherscan-api-key $CELOSCAN_API_KEY --verifier-url "https://api.celoscan.io/api" -vvvv --via-ir --legacy
```

#### Option B: Full Ecosystem (Broadcast Only)
```bash
forge script script/Deploy.s.sol:Deploy --rpc-url https://forno.celo.org --broadcast --legacy
```

#### Option C: Simple Deployment (Lower Gas)
```bash
forge script scripts/DeploySimplePool.s.sol:DeploySimplePool --rpc-url https://forno.celo.org --broadcast --legacy
```

---

### 4. Verification (CRITICAL)
Verification ensures your source code is visible to judges on the Explorer. I have prepared an automated script that uses the **Blockscout Verifier** (does not require an API key).

Run the following command:
```bash
./scripts/verify-mainnet.sh
```

---

### 5. Post-Deployment Configuration
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
