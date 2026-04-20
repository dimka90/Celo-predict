#!/bin/bash

# Celo Mainnet Verification Script (Multi-Method)
# This script tries multiple methods to verify contracts on Celo Mainnet.

# Check if ETHERSCAN_API_KEY is set (for Etherscan V2 method)
if [ -z "$ETHERSCAN_API_KEY" ]; then
    echo "Warning: ETHERSCAN_API_KEY is not set. Etherscan method will be skipped."
fi

RPC_URL="https://forno.celo.org"
CHAIN_ID=42220
COMPILER_VERSION="v0.8.20+commit.a677d6c7"

# Contract addresses from Mainnet deployment
PRIX_TOKEN="0x36489A2cB87fB0ca8E9d0fE2350D082b90FDC68E"
REPUTATION_SYSTEM="0x7E6a2344f250d35EcB8EF5EBF2EEd7Cf73375999"
GUIDED_ORACLE="0xE796e9Da17d83dDf0576A50c5AD9434eD1dA96F3"
OPTIMISTIC_ORACLE="0x2E58C87A0A0121a18EcC31eac34F3DCdBc25949e"
BOOST_SYSTEM="0x8dFb57a5e43726645385c5E3E0C0a0505917eDA4"
STAKING="0x35B4CbEd92d47DacfB4001423a9D065054362496"
POOL_CORE="0xE280fcf3E77ce302e78EB9a7CAb11D18bA4a4Da6"
COMBO_POOLS="0xea70f827C8d130BB5163ae251A598a96937cFD48"
FACTORY="0x9c06E3f414e8A84f2255efC5983d2e669A2A7572"

# Fee collector (deployer address)
FEE_COLLECTOR="0x86E74256beC87d5f542BC9214b708A9dE78e3998"

echo "Starting multi-method contract verification on Celo Mainnet..."
echo ""

verify_contract() {
    local address=$1
    local contract=$2
    local args=$3

    echo "----------------------------------------------------"
    echo "Verifying $contract at $address..."
    
    # Method 1: Sourcify (Decentralized, usually very reliable on Celo)
    echo "Trying Sourcify..."
    forge verify-contract \
        --verifier sourcify \
        --chain $CHAIN_ID \
        $address \
        $contract
    
    # Method 2: Etherscan V2 (if API key provided)
    if [ ! -z "$ETHERSCAN_API_KEY" ]; then
        echo "Trying Etherscan V2..."
        # Using the absolute V2 URL that includes the chain ID as a query param
        # We use single quotes to prevent shell escaping the ampersand/query
        forge verify-contract \
            --rpc-url $RPC_URL \
            --verifier etherscan \
            --verifier-url 'https://api.etherscan.io/v2/api?chainid=42220' \
            --etherscan-api-key $ETHERSCAN_API_KEY \
            --compiler-version $COMPILER_VERSION \
            --via-ir \
            --optimizer-runs 200 \
            ${args:+--constructor-args "$args"} \
            $address \
            $contract
    fi
}

echo "1. PRIX Token"
verify_contract $PRIX_TOKEN contracts/PredinexToken.sol:PredinexToken

echo "2. Reputation System"
verify_contract $REPUTATION_SYSTEM contracts/ReputationSystem.sol:ReputationSystem

echo "3. Guided Oracle"
verify_contract $GUIDED_ORACLE contracts/GuidedOracle.sol:GuidedOracle

echo "4. Optimistic Oracle"
verify_contract $OPTIMISTIC_ORACLE contracts/OptimisticOracle.sol:OptimisticOracle

echo "5. Boost System"
verify_contract $BOOST_SYSTEM contracts/PredinexBoostSystem.sol:PredinexBoostSystem

echo "6. Staking"
verify_contract $STAKING contracts/PredinexStaking.sol:PredinexStaking "$(cast abi-encode "constructor(address)" $PRIX_TOKEN)"

echo "7. Pool Core"
verify_contract $POOL_CORE contracts/PredinexPoolCore.sol:PredinexPoolCore "$(cast abi-encode "constructor(address,address,address,address)" $PRIX_TOKEN $FEE_COLLECTOR $GUIDED_ORACLE $OPTIMISTIC_ORACLE)"

echo "8. Combo Pools"
verify_contract $COMBO_POOLS contracts/PredinexComboPools.sol:PredinexComboPools

echo "9. Factory"
verify_contract $FACTORY contracts/PredinexPoolFactory.sol:PredinexPoolFactory "$(cast abi-encode "constructor(address,address)" $POOL_CORE $BOOST_SYSTEM)"

echo ""
echo "Multi-method verification complete!"
