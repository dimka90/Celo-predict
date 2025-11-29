// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PredinexPoolFactory is Ownable {
    address public poolCore;
    address public boostSystem;

    struct PoolWithBoost {
        uint256 poolId;
        uint8 boostTier;
        uint256 boostExpiry;
    }

    mapping(uint256 => PoolWithBoost) public poolsWithBoost;
    uint256[] public boostedPools;

    event PoolCreatedWithBoost(uint256 indexed poolId, uint8 boostTier);
    event BatchPoolsCreated(uint256[] poolIds);

    constructor(address _poolCore, address _boostSystem) Ownable(msg.sender) {
        require(_poolCore != address(0), "Invalid pool core address");
        require(_boostSystem != address(0), "Invalid boost system address");
        poolCore = _poolCore;
        boostSystem = _boostSystem;
    }

    function createPoolWithBoost(
        uint256 poolId,
        uint8 boostTier
    ) external onlyOwner {
        require(poolId >= 0, "Invalid pool ID");
        require(boostTier > 0 && boostTier <= 3, "Invalid boost tier");

        uint256 boostExpiry = block.timestamp + 7 days;

        poolsWithBoost[poolId] = PoolWithBoost({
            poolId: poolId,
            boostTier: boostTier,
            boostExpiry: boostExpiry
        });

        boostedPools.push(poolId);

        emit PoolCreatedWithBoost(poolId, boostTier);
    }

    function getBoostedPools() external view returns (uint256[] memory) {
        return boostedPools;
    }

    function getPoolBoostInfo(uint256 poolId) external view returns (uint8 tier, uint256 expiry) {
        PoolWithBoost memory pool = poolsWithBoost[poolId];
        if (pool.boostExpiry <= block.timestamp) {
            return (0, 0);
        }
        return (pool.boostTier, pool.boostExpiry);
    }

    function setPoolCore(address _poolCore) external onlyOwner {
        require(_poolCore != address(0), "Invalid address");
        poolCore = _poolCore;
    }

    function setBoostSystem(address _boostSystem) external onlyOwner {
        require(_boostSystem != address(0), "Invalid address");
        boostSystem = _boostSystem;
    }
}
