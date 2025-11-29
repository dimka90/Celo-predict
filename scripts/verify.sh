#!/bin/bash

# Celo Sepolia Verification Script
# This script verifies all deployed contracts on Celoscan

RPC_URL="https://celo-sepolia.g.alchemy.com/v2/tjgIQUEkZoDp_7ACuP7nWxcwkNoWM6Je"
VERIFIER="blockscout"
VERIFIER_URL="https://sepolia.celoscan.io/api/"
COMPILER_VERSION="v0.8.20+commit.a677d6c7"

# Contract addresses
PRIX_TOKEN="0xeC355831Fc4Db844e6908a374907191175dD5c19"
POOL_CORE="0x7c14AB04b2E48b26921f78b0dF0d6B71aaD3B8Aa"
GUIDED_ORACLE="0x139906d5AB3BF22dfdCC0132565C4d4A4Ed48E9E"
OPTIMISTIC_ORACLE="0x6E75BAe1B17558a4746f2CA5CD82Bb5d8F4B1288"

echo "Starting contract verification on Celo Sepolia..."
echo ""

# Verify PRIX Token
echo "Verifying PRIX Token at $PRIX_TOKEN..."
forge verify-contract \
  --rpc-url $RPC_URL \
  --verifier $VERIFIER \
  --verifier-url $VERIFIER_URL \
  --compiler-version $COMPILER_VERSION \
  --via-ir \
  $PRIX_TOKEN \
  contracts/PredinexToken.sol:PredinexToken

echo ""

# Verify Guided Oracle
echo "Verifying Guided Oracle at $GUIDED_ORACLE..."
forge verify-contract \
  --rpc-url $RPC_URL \
  --verifier $VERIFIER \
  --verifier-url $VERIFIER_URL \
  --compiler-version $COMPILER_VERSION \
  --via-ir \
  $GUIDED_ORACLE \
  contracts/GuidedOracle.sol:GuidedOracle

echo ""

# Verify Optimistic Oracle
echo "Verifying Optimistic Oracle at $OPTIMISTIC_ORACLE..."
forge verify-contract \
  --rpc-url $RPC_URL \
  --verifier $VERIFIER \
  --verifier-url $VERIFIER_URL \
  --compiler-version $COMPILER_VERSION \
  --via-ir \
  $OPTIMISTIC_ORACLE \
  contracts/OptimisticOracle.sol:OptimisticOracle

echo ""

# Verify Pool Core (with constructor args)
echo "Verifying Pool Core at $POOL_CORE..."
forge verify-contract \
  --rpc-url $RPC_URL \
  --verifier $VERIFIER \
  --verifier-url $VERIFIER_URL \
  --compiler-version $COMPILER_VERSION \
  --via-ir \
  --constructor-args $(cast abi-encode "constructor(address,address,address,address)" $PRIX_TOKEN $(cast wallet address) $GUIDED_ORACLE $OPTIMISTIC_ORACLE) \
  $POOL_CORE \
  contracts/PredinexPoolCore.sol:PredinexPoolCore

echo ""
echo "Verification complete!"
