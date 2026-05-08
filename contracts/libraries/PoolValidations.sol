// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library PoolValidations {
    function validateOdds(uint256 odds) internal pure {
        require(odds > 100 && odds <= 10000, "Invalid odds");
    }

    function validateStake(uint256 stake, uint256 minStake, uint256 maxStake) internal pure {
        require(stake >= minStake, "Stake below minimum");
        require(stake <= maxStake, "Stake above maximum");
    }

    function validateEventTiming(
        uint256 eventStart,
        uint256 eventEnd,
        uint256 bettingGracePeriod
    ) internal view {
        require(eventStart > block.timestamp, "Event must be in future");
        require(eventEnd > eventStart, "Event end must be after start");
        require(eventStart > block.timestamp + bettingGracePeriod, "Event too soon");
    }

    function validateBetAmount(uint256 amount, uint256 minBet, uint256 maxBet) internal pure {
        require(amount >= minBet, "Bet below minimum");
        require(amount <= maxBet, "Bet above maximum");
    }
}
