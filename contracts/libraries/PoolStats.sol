// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library PoolStats {
    function isPoolSettled(uint8 flags) internal pure returns (bool) {
        return (flags & 1) != 0;
    }

    function creatorSideWon(uint8 flags) internal pure returns (bool) {
        return (flags & 2) != 0;
    }

    function isPoolPrivate(uint8 flags) internal pure returns (bool) {
        return (flags & 4) != 0;
    }

    function poolUsesPrix(uint8 flags) internal pure returns (bool) {
        return (flags & 8) != 0;
    }

    function isPoolFilledAbove60(uint8 flags) internal pure returns (bool) {
        return (flags & 16) != 0;
    }

    function isPoolRefunded(uint8 flags) internal pure returns (bool) {
        return (flags & 32) != 0;
    }

    function checkRefundEligibility(uint256 totalBettorStake, uint8 flags) internal pure returns (bool) {
        return totalBettorStake == 0 && !isPoolSettled(flags);
    }

    function getAdjustedFeeRate(uint256 prixBalance, uint256 platformFee) internal pure returns (uint256) {
        // Apply discount based on PRIX balance
        if (prixBalance >= 500000 * 1e18) return (platformFee * 50) / 100;  // 50% discount
        if (prixBalance >= 200000 * 1e18) return (platformFee * 70) / 100;  // 30% discount
        if (prixBalance >= 50000 * 1e18) return (platformFee * 80) / 100;   // 20% discount
        if (prixBalance >= 5000 * 1e18) return (platformFee * 90) / 100;    // 10% discount
        return platformFee;
    }

    function getPoolTimingInfo(
        uint256 eventStart,
        uint256 eventEnd,
        uint256 bettingEnd
    ) internal view returns (
        uint256 timeUntilBettingEnd,
        uint256 timeUntilEventStart,
        uint256 timeUntilEventEnd,
        uint256 timeUntilStart
    ) {
        uint256 currentTime = block.timestamp;
        timeUntilBettingEnd = currentTime < bettingEnd ? bettingEnd - currentTime : 0;
        timeUntilEventStart = currentTime < eventStart ? eventStart - currentTime : 0;
        timeUntilEventEnd = currentTime < eventEnd ? eventEnd - currentTime : 0;
        timeUntilStart = currentTime < eventStart ? eventStart - currentTime : 0;
    }
}
