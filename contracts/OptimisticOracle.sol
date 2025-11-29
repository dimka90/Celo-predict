// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract OptimisticOracle is Ownable {
    struct Market {
        uint256 poolId;
        string question;
        string category;
        uint256 eventEndTime;
        bool isSettled;
        bytes outcome;
        uint256 createdAt;
    }

    mapping(string => Market) public markets;
    mapping(string => bool) public marketExists;

    event MarketCreated(string indexed marketId, uint256 indexed poolId, string question, string category, uint256 eventEndTime);
    event OutcomeProposed(string indexed marketId, bytes outcome, uint256 timestamp);
    event OutcomeDisputed(string indexed marketId, uint256 timestamp);
    event MarketResolved(string indexed marketId, bytes outcome, uint256 timestamp);

    constructor() Ownable(msg.sender) {}

    function createMarket(
        string memory marketId,
        uint256 poolId,
        string memory question,
        string memory category,
        uint256 eventEndTime
    ) external onlyOwner {
        require(bytes(marketId).length > 0, "Invalid market ID");
        require(!marketExists[marketId], "Market already exists");
        require(eventEndTime > block.timestamp, "Event end time must be in future");

        markets[marketId] = Market({
            poolId: poolId,
            question: question,
            category: category,
            eventEndTime: eventEndTime,
            isSettled: false,
            outcome: "",
            createdAt: block.timestamp
        });

        marketExists[marketId] = true;

        emit MarketCreated(marketId, poolId, question, category, eventEndTime);
    }

    function proposeOutcome(string memory marketId, bytes memory outcome) external onlyOwner {
        require(marketExists[marketId], "Market does not exist");
        require(!markets[marketId].isSettled, "Market already settled");

        markets[marketId].outcome = outcome;
        emit OutcomeProposed(marketId, outcome, block.timestamp);
    }

    function resolveMarket(string memory marketId, bytes memory outcome) external onlyOwner {
        require(marketExists[marketId], "Market does not exist");
        require(!markets[marketId].isSettled, "Market already settled");
        require(block.timestamp >= markets[marketId].eventEndTime, "Event has not ended");

        markets[marketId].outcome = outcome;
        markets[marketId].isSettled = true;

        emit MarketResolved(marketId, outcome, block.timestamp);
    }

    function getOutcome(string memory marketId) external view returns (bool isSettled, bytes memory outcome) {
        require(marketExists[marketId], "Market does not exist");
        Market memory market = markets[marketId];
        return (market.isSettled, market.outcome);
    }

    function getMarket(string memory marketId) external view returns (Market memory) {
        require(marketExists[marketId], "Market does not exist");
        return markets[marketId];
    }

    function isMarketSettled(string memory marketId) external view returns (bool) {
        require(marketExists[marketId], "Market does not exist");
        return markets[marketId].isSettled;
    }
}
