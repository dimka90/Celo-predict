#!/bin/bash

# Celo Mainnet Verification Script
# This script verifies all deployed contracts on Celo Explorer (Blockscout)

RPC_URL="https://forno.celo.org"
VERIFIER="blockscout"
VERIFIER_URL="https://explorer.celo.org/api?"
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

echo "Starting contract verification on Celo Mainnet..."
echo ""

# 1. Verify PRIX Token
echo "Verifying PRIX Token..."
forge verify-contract \
  --rpc-url $RPC_URL \
  --verifier $VERIFIER \
  --verifier-url $VERIFIER_URL \
  --compiler-version $COMPILER_VERSION \
  --via-ir \
  $PRIX_TOKEN \
  contracts/PredinexToken.sol:PredinexToken

# 2. Verify Reputation System
echo "Verifying Reputation System..."
forge verify-contract \
  --rpc-url $RPC_URL \
  --verifier $VERIFIER \
  --verifier-url $VERIFIER_URL \
  --compiler-version $COMPILER_VERSION \
  --via-ir \
  $REPUTATION_SYSTEM \
  contracts/ReputationSystem.sol:ReputationSystem

# 3. Verify Guided Oracle
echo "Verifying Guided Oracle..."
forge verify-contract \
  --rpc-url $RPC_URL \
  --verifier $VERIFIER \
  --verifier-url $VERIFIER_URL \
  --compiler-version $COMPILER_VERSION \
  --via-ir \
  $GUIDED_ORACLE \
  contracts/GuidedOracle.sol:GuidedOracle

# 4. Verify Optimistic Oracle
echo "Verifying Optimistic Oracle..."
forge verify-contract \
  --rpc-url $RPC_URL \
  --verifier $VERIFIER \
  --verifier-url $VERIFIER_URL \
  --compiler-version $COMPILER_VERSION \
  --via-ir \
  $OPTIMISTIC_ORACLE \
  contracts/OptimisticOracle.sol:OptimisticOracle

# 5. Verify Boost System
echo "Verifying Boost System..."
forge verify-contract \
  --rpc-url $RPC_URL \
  --verifier $VERIFIER \
  --verifier-url $VERIFIER_URL \
  --compiler-version $COMPILER_VERSION \
  --via-ir \
  $BOOST_SYSTEM \
  contracts/PredinexBoostSystem.sol:PredinexBoostSystem

# 6. Verify Staking
echo "Verifying Staking..."
forge verify-contract \
  --rpc-url $RPC_URL \
  --verifier $VERIFIER \
  --verifier-url $VERIFIER_URL \
  --compiler-version $COMPILER_VERSION \
  --via-ir \
  --constructor-args $(cast abi-encode "constructor(address)" $PRIX_TOKEN) \
  $STAKING \
  contracts/PredinexStaking.sol:PredinexStaking

# 7. Verify Pool Core
echo "Verifying Pool Core..."
forge verify-contract \
  --rpc-url $RPC_URL \
  --verifier $VERIFIER \
  --verifier-url $VERIFIER_URL \
  --compiler-version $COMPILER_VERSION \
  --via-ir \
  --constructor-args $(cast abi-encode "constructor(address,address,address,address)" $PRIX_TOKEN $FEE_COLLECTOR $GUIDED_ORACLE $OPTIMISTIC_ORACLE) \
  $POOL_CORE \
  contracts/PredinexPoolCore.sol:PredinexPoolCore

# 8. Verify Combo Pools
echo "Verifying Combo Pools..."
forge verify-contract \
  --rpc-url $RPC_URL \
  --verifier $VERIFIER \
  --verifier-url $VERIFIER_URL \
  --compiler-version $COMPILER_VERSION \
  --via-ir \
  $COMBO_POOLS \
  contracts/PredinexComboPools.sol:PredinexComboPools

# 9. Verify Factory
echo "Verifying Factory..."
forge verify-contract \
  --rpc-url $RPC_URL \
  --verifier $VERIFIER \
  --verifier-url $VERIFIER_URL \
  --compiler-version $COMPILER_VERSION \
  --via-ir \
  --constructor-args $(cast abi-encode "constructor(address,address)" $POOL_CORE $BOOST_SYSTEM) \
  $FACTORY \
  contracts/PredinexPoolFactory.sol:PredinexPoolFactory

echo ""
echo "Verification complete!"
