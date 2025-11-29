// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/PredinexToken.sol";
import "../contracts/ReputationSystem.sol";
import "../contracts/GuidedOracle.sol";
import "../contracts/OptimisticOracle.sol";
import "../contracts/PredinexBoostSystem.sol";
import "../contracts/PredinexStaking.sol";
import "../contracts/PredinexPoolCore.sol";
import "../contracts/PredinexComboPools.sol";
import "../contracts/PredinexPoolFactory.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy PRIX Token
        PredinexToken prix = new PredinexToken();
        console.log("PRIX Token:", address(prix));

        // 2. Deploy Reputation System
        ReputationSystem reputation = new ReputationSystem();
        console.log("Reputation System:", address(reputation));

        // 3. Deploy Oracles
        GuidedOracle guidedOracle = new GuidedOracle();
        console.log("Guided Oracle:", address(guidedOracle));

        OptimisticOracle optimisticOracle = new OptimisticOracle();
        console.log("Optimistic Oracle:", address(optimisticOracle));

        // 4. Deploy Boost System
        PredinexBoostSystem boostSystem = new PredinexBoostSystem();
        console.log("Boost System:", address(boostSystem));

        // 5. Deploy Staking
        PredinexStaking staking = new PredinexStaking(address(prix));
        console.log("Staking:", address(staking));

        // 6. Deploy Pool Core (MAIN)
        PredinexPoolCore poolCore = new PredinexPoolCore(
            address(prix),
            msg.sender,
            address(guidedOracle),
            address(optimisticOracle)
        );
        console.log("Pool Core:", address(poolCore));

        // 7. Deploy Combo Pools
        PredinexComboPools comboPools = new PredinexComboPools();
        console.log("Combo Pools:", address(comboPools));

        // 8. Deploy Factory
        PredinexPoolFactory factory = new PredinexPoolFactory(
            address(poolCore),
            address(boostSystem)
        );
        console.log("Factory:", address(factory));

        // 9. Configure Pool Core
        poolCore.setReputationSystem(address(reputation));
        poolCore.setBoostSystem(address(boostSystem));

        vm.stopBroadcast();

        // Log all addresses for verification
        console.log("\n=== DEPLOYMENT COMPLETE ===");
        console.log("Update your .env.local with these addresses:");
        console.log("NEXT_PUBLIC_PRIX_TOKEN_ADDRESS=", address(prix));
        console.log("NEXT_PUBLIC_POOL_CORE_ADDRESS=", address(poolCore));
        console.log("NEXT_PUBLIC_BOOST_SYSTEM_ADDRESS=", address(boostSystem));
        console.log("NEXT_PUBLIC_COMBO_POOLS_ADDRESS=", address(comboPools));
        console.log("NEXT_PUBLIC_FACTORY_ADDRESS=", address(factory));
        console.log("NEXT_PUBLIC_GUIDED_ORACLE_ADDRESS=", address(guidedOracle));
        console.log("NEXT_PUBLIC_OPTIMISTIC_ORACLE_ADDRESS=", address(optimisticOracle));
        console.log("NEXT_PUBLIC_REPUTATION_SYSTEM_ADDRESS=", address(reputation));
        console.log("NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=", address(staking));
    }
}
