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
        console.log("PRIX Token deployed at:", address(prix));

        // 2. Deploy Reputation System
        ReputationSystem reputation = new ReputationSystem();
        console.log("Reputation System deployed at:", address(reputation));

        // 3. Deploy Guided Oracle
        GuidedOracle guidedOracle = new GuidedOracle();
        console.log("Guided Oracle deployed at:", address(guidedOracle));

        // 4. Deploy Optimistic Oracle
        OptimisticOracle optimisticOracle = new OptimisticOracle();
        console.log("Optimistic Oracle deployed at:", address(optimisticOracle));

        // 5. Deploy Boost System
        PredinexBoostSystem boostSystem = new PredinexBoostSystem();
        console.log("Boost System deployed at:", address(boostSystem));

        // 6. Deploy Staking
        PredinexStaking staking = new PredinexStaking(address(prix));
        console.log("Staking deployed at:", address(staking));

        // 7. Deploy Pool Core (MAIN CONTRACT)
        PredinexPoolCore poolCore = new PredinexPoolCore(
            address(prix),
            msg.sender,  // Fee collector
            address(guidedOracle),
            address(optimisticOracle)
        );
        console.log("Pool Core deployed at:", address(poolCore));

        // 8. Deploy Combo Pools
        PredinexComboPools comboPools = new PredinexComboPools();
        console.log("Combo Pools deployed at:", address(comboPools));

        // 9. Deploy Factory
        PredinexPoolFactory factory = new PredinexPoolFactory(
            address(poolCore),
            address(boostSystem)
        );
        console.log("Factory deployed at:", address(factory));

        // 10. Configure Pool Core
        poolCore.setReputationSystem(address(reputation));
        poolCore.setBoostSystem(address(boostSystem));
        console.log("Pool Core configured");

        vm.stopBroadcast();

        // Print summary
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("PRIX Token:", address(prix));
        console.log("Reputation System:", address(reputation));
        console.log("Guided Oracle:", address(guidedOracle));
        console.log("Optimistic Oracle:", address(optimisticOracle));
        console.log("Boost System:", address(boostSystem));
        console.log("Staking:", address(staking));
        console.log("Pool Core:", address(poolCore));
        console.log("Combo Pools:", address(comboPools));
        console.log("Factory:", address(factory));
    }
}
