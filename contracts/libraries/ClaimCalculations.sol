// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library ClaimCalculations {
    struct PoolData {
        uint256 odds;
        uint256 creatorStake;
        uint256 totalCreatorSideStake;
        uint256 totalBettorStake;
    }

    function creatorSideWon(bytes32 predicted, bytes32 actual) internal pure returns (bool) {
        return predicted != actual;
    }

    function calculateCreatorClaim(PoolData memory pool) internal pure returns (uint256) {
        if (pool.totalBettorStake == 0) {
            return pool.creatorStake;
        }
        return pool.totalCreatorSideStake + pool.totalBettorStake;
    }

    function calculateBettorPayout(
        uint256 stake,
        uint256 odds,
        uint256 feeRate
    ) internal pure returns (uint256 grossPayout, uint256 netPayout, uint256 fee) {
        grossPayout = (stake * odds) / 100;
        fee = (grossPayout * feeRate) / 10000;
        netPayout = grossPayout - fee;
        return (grossPayout, netPayout, fee);
    }

    function getRemainingStakesForLP(PoolData memory pool) internal pure returns (uint256) {
        if (pool.totalBettorStake == 0) {
            return 0;
        }
        return pool.totalBettorStake;
    }

    function calculateLPReward(
        PoolData memory pool,
        mapping(uint256 => mapping(address => uint256)) storage lpStakes,
        mapping(uint256 => address[]) storage poolLPs,
        uint256 poolId,
        address user,
        uint256 userLPStake,
        uint256 remainingStakes
    ) internal view returns (uint256) {
        if (remainingStakes == 0) {
            return userLPStake;
        }

        uint256 totalLPStake = 0;
        address[] memory lps = poolLPs[poolId];
        for (uint256 i = 0; i < lps.length; i++) {
            totalLPStake += lpStakes[poolId][lps[i]];
        }

        if (totalLPStake == 0) {
            return userLPStake;
        }

        uint256 userShare = (userLPStake * 10000) / totalLPStake;
        uint256 userReward = (remainingStakes * userShare) / 10000;
        return userLPStake + userReward;
    }
}
