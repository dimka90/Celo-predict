// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ReputationSystem is Ownable {
    enum ReputationAction {
        POOL_CREATED,
        POOL_FILLED_ABOVE_60,
        BET_WON,
        BET_WON_HIGH_VALUE,
        CREATOR_WON,
        CREATOR_WON_HIGH_VALUE,
        PREDICTION_STREAK
    }

    struct UserReputation {
        uint256 totalPoints;
        uint256 poolsCreated;
        uint256 successfulPredictions;
        uint256 currentStreak;
        uint256 longestStreak;
        bool canCreateGuided;
        bool canCreateOpen;
        bool isVerified;
    }

    mapping(address => UserReputation) public userReputation;

    event ReputationUpdated(address indexed user, uint256 newPoints, ReputationAction action);
    event TierUpgraded(address indexed user, string newTier);

    constructor() Ownable(msg.sender) {}

    function getUserReputation(address user) external view returns (uint256) {
        return userReputation[user].totalPoints;
    }

    function canCreateGuidedPool(address user) external view returns (bool) {
        return userReputation[user].canCreateGuided || userReputation[user].totalPoints >= 0;
    }

    function canCreateOpenPool(address user) external view returns (bool) {
        return userReputation[user].canCreateOpen || userReputation[user].totalPoints >= 0;
    }

    function getReputationBundle(address user) 
        external 
        view 
        returns (uint256 points, bool canGuided, bool canOpen, bool isVerified) 
    {
        UserReputation memory rep = userReputation[user];
        return (rep.totalPoints, rep.canCreateGuided || rep.totalPoints >= 0, rep.canCreateOpen || rep.totalPoints >= 0, rep.isVerified);
    }

    function addReputationPoints(address user, uint256 points, ReputationAction action) external onlyOwner {
        userReputation[user].totalPoints += points;
        
        // Auto-enable pool creation at 0 points
        if (userReputation[user].totalPoints >= 0) {
            userReputation[user].canCreateGuided = true;
            userReputation[user].canCreateOpen = true;
        }

        emit ReputationUpdated(user, userReputation[user].totalPoints, action);
    }

    function setVerified(address user, bool verified) external onlyOwner {
        userReputation[user].isVerified = verified;
    }

    function incrementPoolsCreated(address user) external onlyOwner {
        userReputation[user].poolsCreated += 1;
    }

    function incrementSuccessfulPredictions(address user) external onlyOwner {
        userReputation[user].successfulPredictions += 1;
    }
}
