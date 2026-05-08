// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimplePoolCreator is Ownable {
    IERC20 public prixToken;
    
    uint256 public poolCount;
    uint256 public constant creationFeeCELO = 1e16; // 0.01 CELO
    uint256 public constant minPoolStakeCELO = 1e18; // 1 CELO
    
    struct Pool {
        address creator;
        string title;
        string description;
        uint256 creatorStake;
        uint256 createdAt;
        uint256 eventStartTime;
        uint256 eventEndTime;
        bool settled;
        string outcome;
    }
    
    mapping(uint256 => Pool) public pools;
    
    event PoolCreated(
        uint256 indexed poolId,
        address indexed creator,
        string title,
        uint256 creatorStake,
        uint256 eventStartTime
    );
    
    event PoolSettled(uint256 indexed poolId, string outcome);
    
    event BetPlaced(uint256 indexed poolId, address indexed bettor, uint256 amount);
    
    event BetPlacedWithDetails(
        uint256 indexed poolId,
        address indexed bettor,
        uint256 amount,
        uint256 timestamp
    );
    
    constructor(address _prixToken) Ownable(msg.sender) {
        prixToken = IERC20(_prixToken);
    }
    
    function createPool(
        string memory _title,
        string memory _description,
        uint256 _creatorStake,
        uint256 _eventStartTime,
        uint256 _eventEndTime
    ) external payable returns (uint256) {
        require(_creatorStake >= minPoolStakeCELO, "Stake too low");
        require(_eventStartTime > block.timestamp + 60, "Event must be 60+ seconds in future");
        require(_eventEndTime > _eventStartTime, "End time must be after start time");
        require(msg.value == _creatorStake + creationFeeCELO, "Incorrect CELO amount");
        
        uint256 poolId = poolCount++;
        
        pools[poolId] = Pool({
            creator: msg.sender,
            title: _title,
            description: _description,
            creatorStake: _creatorStake,
            createdAt: block.timestamp,
            eventStartTime: _eventStartTime,
            eventEndTime: _eventEndTime,
            settled: false,
            outcome: ""
        });
        
        emit PoolCreated(poolId, msg.sender, _title, _creatorStake, _eventStartTime);
        
        return poolId;
    }
    
    mapping(uint256 => mapping(address => uint256)) public bets; // poolId => user => amount
    mapping(uint256 => uint256) public totalBets; // poolId => total bet amount
    
    function placeBet(uint256 _poolId, uint256 _amount) external payable {
        require(_poolId < poolCount, "Pool does not exist");
        Pool storage pool = pools[_poolId];
        require(!pool.settled, "Pool already settled");
        require(block.timestamp < pool.eventStartTime, "Betting closed");
        require(msg.value == _amount, "Incorrect amount sent");
        require(_amount > 0, "Bet amount must be > 0");
        
        bets[_poolId][msg.sender] += _amount;
        totalBets[_poolId] += _amount;
        
        emit BetPlaced(_poolId, msg.sender, _amount);
        emit BetPlacedWithDetails(_poolId, msg.sender, _amount, block.timestamp);
    }
    
    function settlePool(uint256 _poolId, string memory _outcome) external {
        require(_poolId < poolCount, "Pool does not exist");
        Pool storage pool = pools[_poolId];
        require(msg.sender == pool.creator || msg.sender == owner(), "Not authorized");
        require(!pool.settled, "Pool already settled");
        require(block.timestamp >= pool.eventEndTime, "Event not ended yet");
        
        pool.settled = true;
        pool.outcome = _outcome;
        
        emit PoolSettled(_poolId, _outcome);
    }
    
    function getPool(uint256 _poolId) external view returns (Pool memory) {
        require(_poolId < poolCount, "Pool does not exist");
        return pools[_poolId];
    }
    
    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
