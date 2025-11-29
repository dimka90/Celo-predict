// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract GuidedOracle is Ownable {
    mapping(string => bytes) public outcomes;
    mapping(string => bool) public isOutcomeSet;
    mapping(string => uint256) public outcomeTimestamp;

    event OutcomeSubmitted(string indexed marketId, bytes outcome, uint256 timestamp);
    event OutcomeUpdated(string indexed marketId, bytes outcome, uint256 timestamp);

    constructor() Ownable(msg.sender) {}

    function submitOutcome(string memory marketId, bytes memory outcome) external onlyOwner {
        require(bytes(marketId).length > 0, "Invalid market ID");
        
        if (isOutcomeSet[marketId]) {
            emit OutcomeUpdated(marketId, outcome, block.timestamp);
        } else {
            emit OutcomeSubmitted(marketId, outcome, block.timestamp);
        }
        
        outcomes[marketId] = outcome;
        isOutcomeSet[marketId] = true;
        outcomeTimestamp[marketId] = block.timestamp;
    }

    function getOutcome(string memory marketId) external view returns (bool isSet, bytes memory resultData) {
        return (isOutcomeSet[marketId], outcomes[marketId]);
    }

    function isOutcomeAvailable(string memory marketId) external view returns (bool) {
        return isOutcomeSet[marketId];
    }

    function clearOutcome(string memory marketId) external onlyOwner {
        isOutcomeSet[marketId] = false;
        outcomes[marketId] = "";
        outcomeTimestamp[marketId] = 0;
    }
}
