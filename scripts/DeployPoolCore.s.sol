// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/PredinexToken.sol";
import "../contracts/GuidedOracle.sol";
import "../contracts/OptimisticOracle.sol";
import "../contracts/PredinexPoolCore.sol";

contract DeployPoolCore is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy PRIX Token (required by PoolCore)
        PredinexToken prix = new PredinexToken();
        console.log("PRIX Token:", address(prix));

        // 2. Deploy Oracles (required by PoolCore)
        GuidedOracle guidedOracle = new GuidedOracle();
        console.log("Guided Oracle:", address(guidedOracle));

        OptimisticOracle optimisticOracle = new OptimisticOracle();
        console.log("Optimistic Oracle:", address(optimisticOracle));

        // 3. Deploy Pool Core (MAIN - responsible for creating markets)
        PredinexPoolCore poolCore = new PredinexPoolCore(
            address(prix),
            msg.sender,
            address(guidedOracle),
            address(optimisticOracle)
        );
        console.log("Pool Core:", address(poolCore));

        vm.stopBroadcast();

        console.log("\n=== DEPLOYMENT COMPLETE ===");
        console.log("Update your .env.local with these addresses:");
        console.log("NEXT_PUBLIC_PRIX_TOKEN_ADDRESS=", address(prix));
        console.log("NEXT_PUBLIC_POOL_CORE_ADDRESS=", address(poolCore));
        console.log("NEXT_PUBLIC_GUIDED_ORACLE_ADDRESS=", address(guidedOracle));
        console.log("NEXT_PUBLIC_OPTIMISTIC_ORACLE_ADDRESS=", address(optimisticOracle));
    }
}
