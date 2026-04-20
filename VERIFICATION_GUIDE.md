# Manual Verification Guide for Celo Explorer

Since automated verification via API is currently unstable on Celo Explorer, please follow these steps to verify your contracts manually. This takes about 2 minutes and is 100% reliable.

### Steps for Each Contract:
1.  Go to the Explorer link provided below.
2.  Click the **Contract** tab.
3.  Click the **Verify & Publish** button.
4.  Select the following settings:
    - **Verification Method**: `Solidity (Single file)`
    - **Compiler Version**: `0.8.20+commit.a677d6c7`
    - **Open Source License Type**: `MIT`
5.  Click **Continue**.
6.  On the next page:
    - **Optimization**: `Yes`
    - **Optimization Runs**: `200`
    - **EVM Version**: `london`
    - **Enter the Solidity Contract Code**: Copy and paste the contents of the flattened file (links below).
    - **Constructor Arguments**: Paste the encoded string provided below.
7.  Click **Verify & Publish**.

---

### 1. PredinexPoolCore (Main Protocol)
- **Explorer Link**: [0xE280...4Da6](https://explorer.celo.org/mainnet/address/0xE280fcf3E77ce302e78EB9a7CAb11D18bA4a4Da6/contract-verification)
- **Flattened Code**: [PredinexPoolCore_flat.sol](file:///home/dimka/Desktop/Ecosystem/celo/Celo-predict/PredinexPoolCore_flat.sol)
- **Constructor Arguments (ABI encoded)**:
  `0x00000000000000000000000036489a2cb87fb0ca8e9d0fe2350d082b90fdc68e00000000000000000000000086e74256bec87d5f542bc9214b708a9de78e3998000000000000000000000000e796e9da17d83ddf0576a50c5ad9434ed1da96f30000000000000000000000002e58c87a0a0121a18ecc31eac34f3dcdbc25949e`

### 2. PRIX Token
- **Explorer Link**: [0x3648...C68E](https://explorer.celo.org/mainnet/address/0x36489A2cB87fB0ca8E9d0fE2350D082b90FDC68E/contract-verification)
- **Flattened Code**: [PredinexToken_flat.sol](file:///home/dimka/Desktop/Ecosystem/celo/Celo-predict/PredinexToken_flat.sol)
- **Constructor Arguments**: (Leave empty)

### 3. PredinexPoolFactory
- **Explorer Link**: [0x9c06...7572](https://explorer.celo.org/mainnet/address/0x9c06E3f414e8A84f2255efC5983d2e669A2A7572/contract-verification)
- **Flattened Code**: [PredinexPoolFactory_flat.sol](file:///home/dimka/Desktop/Ecosystem/celo/Celo-predict/PredinexPoolFactory_flat.sol)
- **Constructor Arguments**:
  `0x000000000000000000000000e280fcf3e77ce302e78eb9a7cab11d18ba4a4da60000000000000000000000008dfb57a5e43726645385c5e3e0c0a0505917eda4`
