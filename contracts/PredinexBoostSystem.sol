// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PredinexBoostSystem is Ownable {
    enum BoostTier {
        NONE,
        BRONZE,
        SILVER,
        GOLD
    }

    struct PoolBoost {
        BoostTier tier;
        uint256 expiryTime;
        uint256 boostCost;
    }

    mapping(uint256 => PoolBoost) public poolBoosts;
    mapping(address => uint256) public userBoostBalance;

    uint256 public constant BRONZE_COST = 2e18;  // 2 CELO
    uint256 public constant SILVER_COST = 3e18;  // 3 CELO
    uint256 public constant GOLD_COST = 5e18;    // 5 CELO
    uint256 public constant BOOST_DURATION = 7 days;

    event PoolBoosted(uint256 indexed poolId, BoostTier tier, uint256 expiryTime);
    event BoostExpired(uint256 indexed poolId);

    constructor() Ownable(msg.sender) {}

    function boostPool(uint256 poolId, BoostTier tier) external payable {
        require(tier != BoostTier.NONE, "Invalid boost tier");
        require(poolId >= 0, "Invalid pool ID");

        uint256 cost = getBoostCost(msg.sender, tier);
        require(msg.value >= cost, "Insufficient payment");

        uint256 expiryTime = block.timestamp + BOOST_DURATION;

        poolBoosts[poolId] = PoolBoost({
            tier: tier,
            expiryTime: expiryTime,
            boostCost: cost
        });

        emit PoolBoosted(poolId, tier, expiryTime);

        // Refund excess
        if (msg.value > cost) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - cost}("");
            require(success, "Refund failed");
        }
    }

    function getPoolBoost(uint256 poolId) external view returns (uint8 tier, uint256 expiry) {
        PoolBoost memory boost = poolBoosts[poolId];
        
        if (boost.expiryTime <= block.timestamp) {
            return (0, 0); // Boost expired
        }

        return (uint8(boost.tier), boost.expiryTime);
    }

    function isPoolBoosted(uint256 poolId) external view returns (bool) {
        PoolBoost memory boost = poolBoosts[poolId];
        return boost.tier != BoostTier.NONE && boost.expiryTime > block.timestamp;
    }

    function getBoostCost(address user, BoostTier tier) public view returns (uint256) {
        if (tier == BoostTier.BRONZE) return BRONZE_COST;
        if (tier == BoostTier.SILVER) return SILVER_COST;
        if (tier == BoostTier.GOLD) return GOLD_COST;
        return 0;
    }

    function getBoostCost(address user) external view returns (uint256) {
        return BRONZE_COST; // Default to bronze cost
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    receive() external payable {}
}
