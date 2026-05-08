// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PredinexStaking is Ownable {
    IERC20 public prixToken;

    struct StakingInfo {
        uint256 amount;
        uint256 startTime;
        uint256 rewards;
    }

    mapping(address => StakingInfo) public stakes;
    uint256 public totalStaked;
    uint256 public rewardRate = 100; // 1% per year (100 basis points)

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event TierUpgraded(address indexed user, string tier);

    constructor(address _prixToken) Ownable(msg.sender) {
        require(_prixToken != address(0), "Invalid token address");
        prixToken = IERC20(_prixToken);
    }

    function stake(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(prixToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        if (stakes[msg.sender].amount > 0) {
            // Claim pending rewards first
            uint256 pending = calculateRewards(msg.sender);
            stakes[msg.sender].rewards += pending;
        }

        stakes[msg.sender].amount += amount;
        stakes[msg.sender].startTime = block.timestamp;
        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        require(stakes[msg.sender].amount >= amount, "Insufficient staked amount");
        require(amount > 0, "Amount must be greater than 0");

        // Claim pending rewards first
        uint256 pending = calculateRewards(msg.sender);
        stakes[msg.sender].rewards += pending;

        stakes[msg.sender].amount -= amount;
        stakes[msg.sender].startTime = block.timestamp;
        totalStaked -= amount;

        require(prixToken.transfer(msg.sender, amount), "Transfer failed");

        emit Unstaked(msg.sender, amount);
    }

    function claimRewards() external {
        uint256 pending = calculateRewards(msg.sender);
        uint256 total = pending + stakes[msg.sender].rewards;
        require(total > 0, "No rewards to claim");

        stakes[msg.sender].rewards = 0;
        stakes[msg.sender].startTime = block.timestamp;

        require(prixToken.transfer(msg.sender, total), "Transfer failed");

        emit RewardsClaimed(msg.sender, total);
    }

    function calculateRewards(address user) public view returns (uint256) {
        StakingInfo memory info = stakes[user];
        if (info.amount == 0) return 0;

        uint256 stakingDuration = block.timestamp - info.startTime;
        uint256 rewards = (info.amount * rewardRate * stakingDuration) / (10000 * 365 days);
        return rewards;
    }

    function getStakingInfo(address user) external view returns (uint256 amount, uint256 rewards, uint256 pending) {
        StakingInfo memory info = stakes[user];
        uint256 pendingRewards = calculateRewards(user);
        return (info.amount, info.rewards, pendingRewards);
    }

    function addRevenue(uint256 prixAmount, uint256 bnbAmount) external onlyOwner {
        // Revenue distribution logic can be added here
        // For now, this is a placeholder for the interface
    }

    function setRewardRate(uint256 newRate) external onlyOwner {
        rewardRate = newRate;
    }

    function withdrawExcess() external onlyOwner {
        uint256 balance = prixToken.balanceOf(address(this));
        uint256 excess = balance - totalStaked;
        require(excess > 0, "No excess to withdraw");
        require(prixToken.transfer(owner(), excess), "Transfer failed");
    }
}
