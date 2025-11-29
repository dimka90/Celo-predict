// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/SimplePoolCreator.sol";
import "../contracts/PredinexToken.sol";

contract DeploySimplePool is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy PRIX Token
        PredinexToken prix = new PredinexToken();
        console.log("PRIX Token:", address(prix));

        // Deploy Simple Pool Creator
        SimplePoolCreator poolCreator = new SimplePoolCreator(address(prix));
        console.log("Simple Pool Creator:", address(poolCreator));

        vm.stopBroadcast();

        console.log("\n=== DEPLOYMENT COMPLETE ===");
        console.log("Update your .env.local:");
        console.log("NEXT_PUBLIC_PRIX_TOKEN_ADDRESS=", address(prix));
        console.log("NEXT_PUBLIC_POOL_CORE_ADDRESS=", address(poolCreator));
    }
}
