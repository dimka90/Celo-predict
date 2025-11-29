// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PredinexComboPools is Ownable {
    struct ComboPool {
        address creator;
        uint256[] poolIds;
        uint256 creatorStake;
        uint256 totalBettorStake;
        bytes32[] predictions;
        bytes32[] results;
        bool isSettled;
        uint256 createdAt;
    }

    mapping(uint256 => ComboPool) public comboPools;
    uint256 public comboPoolCount;

    event ComboPoolCreated(uint256 indexed comboPoolId, address indexed creator, uint256[] poolIds);
    event ComboBetPlaced(uint256 indexed comboPoolId, address indexed bettor, uint256 amount);
    event ComboPoolSettled(uint256 indexed comboPoolId, bool creatorWon);

    constructor() Ownable(msg.sender) {}

    function createComboPool(
        uint256[] memory poolIds,
        bytes32[] memory predictions,
        uint256 creatorStake
    ) external payable returns (uint256) {
        require(poolIds.length > 0, "Must include at least one pool");
        require(poolIds.length == predictions.length, "Pools and predictions length mismatch");
        require(msg.value >= creatorStake, "Insufficient payment");

        uint256 comboPoolId = comboPoolCount;

        comboPools[comboPoolId] = ComboPool({
            creator: msg.sender,
            poolIds: poolIds,
            creatorStake: creatorStake,
            totalBettorStake: 0,
            predictions: predictions,
            results: new bytes32[](predictions.length),
            isSettled: false,
            createdAt: block.timestamp
        });

        comboPoolCount++;

        emit ComboPoolCreated(comboPoolId, msg.sender, poolIds);

        return comboPoolId;
    }

    function placeComboBet(uint256 comboPoolId, uint256 amount) external payable {
        require(comboPoolId < comboPoolCount, "Invalid combo pool ID");
        require(!comboPools[comboPoolId].isSettled, "Combo pool already settled");
        require(msg.value >= amount, "Insufficient payment");

        comboPools[comboPoolId].totalBettorStake += amount;

        emit ComboBetPlaced(comboPoolId, msg.sender, amount);
    }

    function settleComboPool(uint256 comboPoolId, bytes32[] memory results) external onlyOwner {
        require(comboPoolId < comboPoolCount, "Invalid combo pool ID");
        require(!comboPools[comboPoolId].isSettled, "Combo pool already settled");
        require(results.length == comboPools[comboPoolId].predictions.length, "Results length mismatch");

        ComboPool storage pool = comboPools[comboPoolId];
        pool.results = results;
        pool.isSettled = true;

        bool creatorWon = true;
        for (uint256 i = 0; i < results.length; i++) {
            if (results[i] == pool.predictions[i]) {
                creatorWon = false;
                break;
            }
        }

        emit ComboPoolSettled(comboPoolId, creatorWon);
    }

    function getComboPool(uint256 comboPoolId) external view returns (ComboPool memory) {
        require(comboPoolId < comboPoolCount, "Invalid combo pool ID");
        return comboPools[comboPoolId];
    }
}
