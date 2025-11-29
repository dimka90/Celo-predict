// SPDX-License-Identifier: MIT
pragma solidity >=0.4.16 ^0.8.20;

// contracts/libraries/ClaimCalculations.sol

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

// contracts/libraries/PoolStats.sol

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

// contracts/libraries/PoolValidations.sol

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

// node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol

// OpenZeppelin Contracts (last updated v5.4.0) (token/ERC20/IERC20.sol)

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

// node_modules/@openzeppelin/contracts/utils/Context.sol

// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}

// node_modules/@openzeppelin/contracts/utils/ReentrancyGuard.sol

// OpenZeppelin Contracts (last updated v5.1.0) (utils/ReentrancyGuard.sol)

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _status = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        _status = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == ENTERED;
    }
}

// node_modules/@openzeppelin/contracts/access/Ownable.sol

// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

// contracts/ReputationSystem.sol

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

// contracts/PredinexPoolCore.sol

interface IPredinexBoostSystem {
    function getPoolBoost(uint256 poolId) external view returns (uint8 tier, uint256 expiry);
    function isPoolBoosted(uint256 poolId) external view returns (bool);
    function getBoostCost(address user) external view returns (uint256 cost);
}
interface IPredinexStaking {
    function addRevenue(uint256 prixAmount, uint256 bnbAmount) external;
}
interface IReputationSystem {
    function getUserReputation(address user) external view returns (uint256);
    function canCreateGuidedPool(address user) external view returns (bool);
    function canCreateOpenPool(address user) external view returns (bool);
    function getReputationBundle(address user) external view returns (uint256, bool, bool, bool);
}
interface IGuidedOracle {
    function getOutcome(string memory marketId) external view returns (bool isSet, bytes memory resultData);
}
interface IOptimisticOracle {
    function getOutcome(string memory marketId) external view returns (bool isSettled, bytes memory outcome);
    function createMarket(string memory marketId, uint256 poolId, string memory question, string memory category, uint256 eventEndTime) external;
}
enum OracleType {
    GUIDED,
    OPEN
}
enum MarketType {
    MONEYLINE,        // 0 - Winner/Outcome (works for all sports: 1X2, Win/Lose, Above/Below)
    OVER_UNDER,       // 1 - Total points/goals/runs (works for all sports)
    SPREAD,           // 2 - Point spread (basketball, american football, etc.)
    PROPOSITION,      // 3 - Prop bets (first scorer, specific events, etc.)
    CORRECT_SCORE,    // 4 - Exact score/result (football, basketball, etc.)
    CUSTOM            // 5 - Arbitrary YES/NO predictions
}
contract PredinexPoolCore is Ownable, ReentrancyGuard {
    IERC20 public prixToken;
    uint256 public poolCount;
    uint256 public constant creationFeeCELO = 1e16; // 0.01 CELO
    uint256 public constant creationFeePrix = 50e18;
    uint256 public constant platformFee = 500;
    uint256 public constant bettingGracePeriod = 60;
    uint256 public constant arbitrationTimeout = 24 hours;
    uint256 public constant minPoolStakeCELO = 1e18; // 1 CELO
    uint256 public constant minPoolStakePrix = 1000e18;
    uint256 public constant minBetAmount = 1e18;
    uint256 public constant HIGH_ODDS_THRESHOLD = 500;
    uint256 public constant MAX_PARTICIPANTS = 500;
    uint256 public constant MAX_LP_PROVIDERS = 100;
    uint256 public constant REFUND_BATCH_SIZE = 50; 
    address public immutable feeCollector;
    address public immutable guidedOracle;
    address public immutable optimisticOracle;
    IReputationSystem public reputationSystem;
    IPredinexBoostSystem public boostSystem;
    uint256 public totalCollectedBNB;
    uint256 public totalCollectedPrix;
    struct PoolAnalytics {
        uint256 totalVolume;
        uint256 participantCount;
        uint256 averageBetSize;
        uint256 creatorReputation;
        uint256 liquidityRatio;
        uint256 timeToFill;
        bool isHotPool;
        uint256 fillPercentage;
        uint256 lastActivityTime;
    }
    struct CreatorStats {
        uint256 totalPoolsCreated;
        uint256 successfulPools;
        uint256 totalVolumeGenerated;
        uint256 averagePoolSize;
        uint256 reputationScore;
        uint256 winRate;
        uint256 totalEarnings;
        uint256 activePoolsCount;
    }
    struct GlobalStats {
        uint256 totalPools;
        uint256 totalVolume;
        uint256 totalUsers;
        uint256 totalBets;
        uint256 averagePoolSize;
        uint256 lastUpdated;
    }
    struct Pool {
        address creator;           
        uint16 odds;              
        uint8 flags;              
        OracleType oracleType;    
        MarketType marketType;    
        uint8 reserved;           
        uint256 creatorStake;
        uint256 totalCreatorSideStake;
        uint256 maxBettorStake;
        uint256 totalBettorStake;
        bytes32 predictedOutcome;
        bytes32 result;
        uint256 eventStartTime;
        uint256 eventEndTime;
        uint256 bettingEndTime;
        uint256 resultTimestamp;
        uint256 arbitrationDeadline;
        uint256 maxBetPerUser;
        bytes32 league;           
        bytes32 category;         
        bytes32 homeTeam;        
        bytes32 awayTeam;        
        bytes32 title;           
        string marketId;          
    }
    mapping(uint256 => Pool) public pools;
    mapping(uint256 => address[]) public poolBettors;
    mapping(uint256 => mapping(address => uint256)) public bettorStakes;
    mapping(uint256 => string) public poolDisplayData;
    mapping(uint256 => address[]) public poolLPs;
    mapping(uint256 => mapping(address => uint256)) public lpStakes;
    mapping(uint256 => mapping(address => bool)) public claimed;
    mapping(uint256 => mapping(address => bool)) public poolWhitelist;
    mapping(address => CreatorStats) public creatorStats;
    mapping(uint256 => PoolAnalytics) public poolAnalytics;
    GlobalStats public globalStats;
    mapping(uint256 => uint256) public poolCollectedFeesBNB;
    mapping(uint256 => uint256) public poolCollectedFeesPrix;
    mapping(address => uint256) public creatorPendingFeesBNB;
    mapping(address => uint256) public creatorPendingFeesPrix;
    mapping(address => uint256) public predictionStreaks;
    mapping(address => uint256) public longestStreak;
    mapping(address => uint256) public streakMultiplier;
    mapping(bytes32 => uint256[]) public categoryPools;
    mapping(address => uint256[]) public creatorActivePools;
    mapping(uint256 => uint256) public poolIdToCreatorIndex;
    event PoolCreated(uint256 indexed poolId, address indexed creator, uint256 eventStartTime, uint256 eventEndTime, OracleType oracleType, MarketType marketType, string marketId, bytes32 league, bytes32 category);
    event BetPlaced(uint256 indexed poolId, address indexed bettor, uint256 amount, bool isForOutcome);
    event LiquidityAdded(uint256 indexed poolId, address indexed provider, uint256 amount);
    event PoolSettled(uint256 indexed poolId, bytes32 result, bool creatorSideWon, uint256 timestamp);
    event RewardClaimed(uint256 indexed poolId, address indexed user, uint256 amount);
    event PoolRefunded(uint256 indexed poolId, string reason);
    event UserWhitelisted(uint256 indexed poolId, address indexed user);
    event ReputationActionOccurred(address indexed user, ReputationSystem.ReputationAction action, uint256 value, bytes32 indexed poolId, uint256 timestamp);
    event AnalyticsUpdated(uint256 indexed poolId, uint256 totalVolume, uint256 participantCount);
    event CreatorFeeAccrued(uint256 indexed poolId, address indexed creator, uint256 bnbAmount, uint256 prixAmount);
    event CreatorFeeClaimed(address indexed creator, uint256 bnbAmount, uint256 prixAmount);
    constructor(
        address _prixToken,
        address _feeCollector,
        address _guidedOracle,
        address _optimisticOracle
    ) Ownable(msg.sender) {
        require(_prixToken != address(0), "Invalid token address");
        require(_feeCollector != address(0), "Invalid fee collector");
        require(_guidedOracle != address(0), "Invalid guided oracle");
        require(_optimisticOracle != address(0), "Invalid optimistic oracle");
        prixToken = IERC20(_prixToken);
        feeCollector = _feeCollector;
        guidedOracle = _guidedOracle;
        optimisticOracle = _optimisticOracle;
        globalStats.lastUpdated = block.timestamp;
    }
    function setReputationSystem(address _reputationSystem) external onlyOwner {
        reputationSystem = IReputationSystem(_reputationSystem);
    }
    function setBoostSystem(address _boostSystem) external onlyOwner {
        boostSystem = IPredinexBoostSystem(_boostSystem);
    }
    modifier validPool(uint256 poolId) {
        require(poolId < poolCount);
        require(pools[poolId].creator != address(0));
        _;
    }
    modifier onlyOracle() {
        require(msg.sender == guidedOracle || msg.sender == optimisticOracle);
        _;
    }
    function createPool(
        bytes32 _predictedOutcome,
        uint256 _odds,
        uint256 _creatorStake,
        uint256 _eventStartTime,
        uint256 _eventEndTime,
        bytes32 _league,
        bytes32 _category,
        bytes32 _homeTeam,
        bytes32 _awayTeam,
        bytes32 _title,
        bool _isPrivate,
        uint256 _maxBetPerUser,
        bool _usePrix,
        OracleType _oracleType,
        MarketType _marketType,
        string memory _marketId
    ) external payable nonReentrant returns (uint256) {
        require(_odds > 100 && _odds <= 10000);
        if (_oracleType == OracleType.GUIDED) {
            require(_marketType != MarketType.CUSTOM);
        }
        if (address(reputationSystem) != address(0)) {
            (, bool canCreateGuided, bool canCreateOpen,) = reputationSystem.getReputationBundle(msg.sender);
            if (_oracleType == OracleType.OPEN) {
                require(canCreateOpen);
            } else {
                require(canCreateGuided);
            }
        }
        if (_usePrix) {
            require(_creatorStake >= minPoolStakePrix);
        } else {
            require(_creatorStake >= minPoolStakeCELO);
        }
        require(_creatorStake <= 1000000 * 1e18);
        require(_eventStartTime > block.timestamp);
        require(_eventEndTime > _eventStartTime);
        require(_eventStartTime > block.timestamp + bettingGracePeriod);
        
        // Apply fee reduction based on Prix balance
        uint256 baseCreationFee = _usePrix ? creationFeePrix : creationFeeCELO;
        uint256 prixBalance = prixToken.balanceOf(msg.sender);
        uint256 discountMultiplier = 100; // 100% = no discount
        
        // Calculate discount percentage based on Prix balance
        if (prixBalance >= 500000 * 1e18) discountMultiplier = 50;  // 50% discount
        else if (prixBalance >= 200000 * 1e18) discountMultiplier = 70;  // 30% discount
        else if (prixBalance >= 50000 * 1e18) discountMultiplier = 80;   // 20% discount
        else if (prixBalance >= 5000 * 1e18) discountMultiplier = 90;   // 10% discount
        
        uint256 adjustedCreationFee = (baseCreationFee * discountMultiplier) / 100;
        uint256 totalRequired = adjustedCreationFee + _creatorStake;
        if (_usePrix) {
            require(msg.value == 0);
            require(prixToken.transferFrom(msg.sender, address(this), totalRequired));
        } else {
            require(msg.value == totalRequired);
        }
        uint8 flags = 0;
        if (_isPrivate) flags |= 4;      
        if (_usePrix) flags |= 8;        
        pools[poolCount] = Pool({
            creator: msg.sender,
            odds: uint16(_odds),
            flags: flags,
            oracleType: _oracleType,
            marketType: _marketType,
            reserved: 0,
            creatorStake: _creatorStake,
            totalCreatorSideStake: _creatorStake,
            maxBettorStake: 0,
            totalBettorStake: 0,
            predictedOutcome: _predictedOutcome,
            result: bytes32(0),
            eventStartTime: _eventStartTime,
            eventEndTime: _eventEndTime,
            bettingEndTime: _eventStartTime - bettingGracePeriod,
            resultTimestamp: 0,
            arbitrationDeadline: _eventEndTime + arbitrationTimeout,
            maxBetPerUser: _maxBetPerUser,
            league: _league,
            category: _category,
            homeTeam: _homeTeam,
            awayTeam: _awayTeam,
            title: _title,
            marketId: _marketId
        });
        emit PoolCreated(
            poolCount, 
            msg.sender, 
            _eventStartTime, 
            _eventEndTime, 
            _oracleType, 
            _marketType,
            _marketId, 
            _league, 
            _category
        );
        emit ReputationActionOccurred(msg.sender, ReputationSystem.ReputationAction.POOL_CREATED, _creatorStake, bytes32(poolCount), block.timestamp);
        uint256 currentPoolId = poolCount;
        poolCount++;
        
        // ✅ Create market in OptimisticOracle for OPEN pools
        if (_oracleType == OracleType.OPEN) {
            string memory question = string(abi.encodePacked(_title));
            string memory category = string(abi.encodePacked(_category));
            IOptimisticOracle(optimisticOracle).createMarket(_marketId, currentPoolId, question, category, _eventEndTime);
        }
        
        _scheduleRefundCheck(currentPoolId, _eventStartTime);
        return currentPoolId;
    }
    function placeBet(uint256 poolId, uint256 amount) external payable nonReentrant validPool(poolId) {
        Pool storage poolPtr = pools[poolId];
        Pool memory pool = poolPtr;
        require(!_isPoolSettled(poolId));
        require(amount >= minBetAmount);
        require(amount <= 100000 * 1e18);
        require(block.timestamp < pool.bettingEndTime);
        require(amount > 0);
        uint256 effectiveCreatorSideStake = pool.totalBettorStake == 0 || pool.totalBettorStake + amount > pool.creatorStake ? 
            pool.totalCreatorSideStake : pool.creatorStake;
        uint256 poolOdds = uint256(pool.odds);
        uint256 currentMaxBettorStake = (effectiveCreatorSideStake * 100) / (poolOdds - 100);
        require(pool.totalBettorStake + amount <= currentMaxBettorStake);
        uint256 currentBettorStake = bettorStakes[poolId][msg.sender];
        if (currentBettorStake == 0) {
            require(poolBettors[poolId].length < MAX_PARTICIPANTS);
        }
        if (_isPoolPrivate(poolId)) {
            require(poolWhitelist[poolId][msg.sender]);
        }
        if (pool.maxBetPerUser > 0) {
            require(currentBettorStake + amount <= pool.maxBetPerUser);
        }
        if (currentBettorStake == 0) {
            poolBettors[poolId].push(msg.sender);
        }
        bettorStakes[poolId][msg.sender] = currentBettorStake + amount;
        poolPtr.totalBettorStake = pool.totalBettorStake + amount;
        poolPtr.maxBettorStake = currentMaxBettorStake;
        if (!_isPoolFilledAbove60(poolId) && (poolPtr.totalBettorStake * 100) / currentMaxBettorStake >= 60) {
            poolPtr.flags |= 16; 
            emit ReputationActionOccurred(pool.creator, ReputationSystem.ReputationAction.POOL_FILLED_ABOVE_60, poolPtr.totalBettorStake, bytes32(poolId), block.timestamp);
        }
        if (_poolUsesPrix(poolId)) {
            require(prixToken.transferFrom(msg.sender, address(this), amount));
        } else {
            require(msg.value == amount);
        }
        _updatePoolAnalytics(poolId, amount, 1);
        // 🔧 FIX: placeBet is for challenging the creator (YES bet), so isForOutcome = true
        emit BetPlaced(poolId, msg.sender, amount, true);
    }
    function addLiquidity(uint256 poolId, uint256 amount) external payable nonReentrant validPool(poolId) {
        Pool storage pool = pools[poolId];
        require(!_isPoolSettled(poolId));
        require(amount >= minBetAmount);
        require(amount <= 500000 * 1e18);
        require(block.timestamp < pool.bettingEndTime);
        require(pool.totalCreatorSideStake <= type(uint256).max - amount);
        if (lpStakes[poolId][msg.sender] == 0) {
            require(poolLPs[poolId].length < MAX_LP_PROVIDERS);
        }
        if (_isPoolPrivate(poolId)) {
            require(poolWhitelist[poolId][msg.sender]);
        }
        if (lpStakes[poolId][msg.sender] == 0) {
            poolLPs[poolId].push(msg.sender);
        }
        lpStakes[poolId][msg.sender] += amount;
        pool.totalCreatorSideStake += amount;
        uint256 effectiveCreatorSideStake = pool.totalBettorStake == 0 || pool.totalBettorStake > pool.creatorStake ? 
            pool.totalCreatorSideStake : pool.creatorStake;
        uint256 denominator = uint256(pool.odds) - 100;
        pool.maxBettorStake = (effectiveCreatorSideStake * 100) / denominator;
        if (_poolUsesPrix(poolId)) {
            require(prixToken.transferFrom(msg.sender, address(this), amount));
        } else {
            require(msg.value == amount);
        }
        _updatePoolAnalytics(poolId, amount, 0);
        emit LiquidityAdded(poolId, msg.sender, amount);
    }
    function settlePool(uint256 poolId, bytes32 outcome) external validPool(poolId) {
        Pool storage pool = pools[poolId];
        require(!_isPoolSettled(poolId));
        require(block.timestamp >= pool.eventEndTime);
        if (pool.oracleType == OracleType.GUIDED) {
            require(msg.sender == guidedOracle);
        } else if (pool.oracleType == OracleType.OPEN) {
            require(msg.sender == optimisticOracle);
        }
        pool.result = outcome;
        pool.flags |= 1; 
        bool creatorSideWon = (outcome != pool.predictedOutcome);
        if (creatorSideWon) {
            pool.flags |= 2; 
        }
        pool.resultTimestamp = block.timestamp;
        _removePoolFromCreatorActiveList(poolId);
        emit PoolSettled(poolId, outcome, creatorSideWon, block.timestamp);
    }
    function settlePoolAutomatically(uint256 poolId) external validPool(poolId) {
        Pool storage pool = pools[poolId];
        require(!_isPoolSettled(poolId));
        require(block.timestamp >= pool.eventEndTime);
        bytes32 outcome;
        bool isReady = false;
        if (pool.oracleType == OracleType.GUIDED) {
            (bool isSet, bytes memory resultData) = IGuidedOracle(guidedOracle).getOutcome(pool.marketId);
            require(isSet);
            outcome = bytes32(resultData);
            isReady = true;
        } else if (pool.oracleType == OracleType.OPEN) {
            (bool isSettled, bytes memory resultData) = IOptimisticOracle(optimisticOracle).getOutcome(pool.marketId);
            require(isSettled);
            outcome = bytes32(resultData);
            isReady = true;
        }
        require(isReady);
        pool.result = outcome;
        pool.flags |= 1; 
        bool creatorSideWon = (outcome != pool.predictedOutcome);
        if (creatorSideWon) {
            pool.flags |= 2; 
        }
        pool.resultTimestamp = block.timestamp;
        _removePoolFromCreatorActiveList(poolId);
        emit PoolSettled(poolId, outcome, creatorSideWon, block.timestamp);
    }
    function _scheduleRefundCheck(uint256 poolId, uint256 eventStartTime) internal {
        if (block.timestamp >= eventStartTime && pools[poolId].totalBettorStake == 0) {
            _processAutomaticRefund(poolId);
        }
    }
    function _processAutomaticRefund(uint256 poolId) internal {
        Pool storage pool = pools[poolId];
        require(!_isPoolSettled(poolId));
        require(pool.totalBettorStake == 0);
        require(block.timestamp >= pool.eventStartTime);
        pool.flags |= 1; // Mark as settled
        pool.flags |= 32; // Mark as refunded
        pool.result = bytes32(0);
        bool usePrix = _poolUsesPrix(poolId);
        
        // Refund LPs if they exist
        address[] memory lps = poolLPs[poolId];
        for (uint256 i = 0; i < lps.length; ) {
            address lp = lps[i];
            uint256 stake = lpStakes[poolId][lp];
            if (stake > 0) {
                if (usePrix) {
                    require(prixToken.transfer(lp, stake));
                } else {
                    (bool success, ) = payable(lp).call{value: stake}("");
                    require(success, "LP refund failed");
                }
                emit RewardClaimed(poolId, lp, stake);
            }
            unchecked { ++i; }
        }
        
        // Refund creator stake
        if (pool.creatorStake > 0) {
            if (usePrix) {
                require(prixToken.transfer(pool.creator, pool.creatorStake));
            } else {
                (bool success, ) = payable(pool.creator).call{value: pool.creatorStake}("");
                require(success, "Creator refund failed");
            }
            emit RewardClaimed(poolId, pool.creator, pool.creatorStake);
        }
        
        emit PoolSettled(poolId, 0, false, block.timestamp);
    }
    function checkAndRefundEmptyPool(uint256 poolId) external validPool(poolId) {
        Pool storage pool = pools[poolId];
        require(!_isPoolSettled(poolId));
        require(pool.totalBettorStake == 0);
        require(block.timestamp >= pool.eventStartTime);
        _processAutomaticRefund(poolId);
    }
    function isEligibleForRefund(uint256 poolId) external view validPool(poolId) returns (bool) {
        Pool memory pool = pools[poolId];
        return PoolStats.checkRefundEligibility(pool.totalBettorStake, pool.flags);
    }
    function isPoolRefunded(uint256 poolId) external view validPool(poolId) returns (bool) {
        return _isPoolRefunded(poolId);
    }
    function getPoolStats(uint256 poolId) external view validPool(poolId) returns (
        uint256 totalBettorStake,
        uint256 totalCreatorSideStake,
        uint256 bettorCount,
        uint256 lpCount,
        bool isSettled,
        bool isRefunded,
        bool eligibleForRefund,
        uint256 timeUntilEventStart,
        uint256 timeUntilBettingEnd
    ) {
        Pool memory pool = pools[poolId];
        totalBettorStake = pool.totalBettorStake;
        totalCreatorSideStake = pool.totalCreatorSideStake;
        bettorCount = poolBettors[poolId].length;
        lpCount = poolLPs[poolId].length;
        isSettled = PoolStats.isPoolSettled(pool.flags);
        isRefunded = _isPoolRefunded(poolId);
        eligibleForRefund = PoolStats.checkRefundEligibility(pool.totalBettorStake, pool.flags);
        
        (,,,uint256 _timeUntilStart) = PoolStats.getPoolTimingInfo(
            pool.eventStartTime,
            pool.eventEndTime,
            pool.bettingEndTime
        );
        
        timeUntilEventStart = _timeUntilStart;
        timeUntilBettingEnd = block.timestamp < pool.bettingEndTime ? 
            pool.bettingEndTime - block.timestamp : 0;
    }
    function getClaimInfo(uint256 poolId, address user) external view validPool(poolId) returns (
        bool canClaim,
        uint256 claimableAmount,
        bool isWinner,
        uint256 userStake,
        bool alreadyClaimed,
        string memory reason
    ) {
        Pool memory pool = pools[poolId];
        alreadyClaimed = claimed[poolId][user];
        if (!_isPoolSettled(poolId)) return (false, 0, false, 0, alreadyClaimed, "Pool not settled");
        if (alreadyClaimed) return (false, 0, false, 0, true, "Already claimed");
        
        bool creatorSideWon = ClaimCalculations.creatorSideWon(pool.predictedOutcome, pool.result);
        
        if (creatorSideWon) {
            // Check if user is the creator first (priority)
            if (user == pool.creator) {
                userStake = pool.creatorStake;
                if (userStake == 0) return (false, 0, false, 0, false, "No creator stake");
                
                // Use library for creator calculation
                ClaimCalculations.PoolData memory poolData = ClaimCalculations.PoolData({
                    odds: pool.odds,
                    creatorStake: pool.creatorStake,
                    totalCreatorSideStake: pool.totalCreatorSideStake,
                    totalBettorStake: pool.totalBettorStake
                });
                
                claimableAmount = ClaimCalculations.calculateCreatorClaim(poolData);
                return (true, claimableAmount, true, userStake, false, "Ready to claim");
            }
            
            // Check LP stake
            userStake = lpStakes[poolId][user];
            if (userStake == 0) return (false, 0, false, 0, false, "No LP stake");
            
            // Calculate LP payout with FIFO and correspondence
            claimableAmount = _calculateLPPayoutWithFIFO(poolId, user);
            return (true, claimableAmount, true, userStake, false, "Ready to claim");
        } else {
            // Bettor wins: Bettor Stake * Odds
            userStake = bettorStakes[poolId][user];
            if (userStake == 0) return (false, 0, false, 0, false, "No bet placed");
            
            // Use library for bettor calculation
            (, uint256 netPayout,) = ClaimCalculations.calculateBettorPayout(
                userStake,
                pool.odds,
                adjustedFeeRate(user)
            );
            claimableAmount = netPayout;
            return (true, claimableAmount, true, userStake, false, "Ready to claim");
        }
    }
    function _calculateLPPayoutWithFIFO(uint256 poolId, address user) internal view returns (uint256) {
        Pool memory pool = pools[poolId];
        uint256 userLPStake = lpStakes[poolId][user];
        if (userLPStake == 0) return 0;
        
        // Use library to get remaining stakes after creator
        ClaimCalculations.PoolData memory poolData = ClaimCalculations.PoolData({
            odds: pool.odds,
            creatorStake: pool.creatorStake,
            totalCreatorSideStake: pool.totalCreatorSideStake,
            totalBettorStake: pool.totalBettorStake
        });
        
        uint256 remainingStakes = ClaimCalculations.getRemainingStakesForLP(poolData);
        
        // Use library to calculate LP reward with FIFO
        return ClaimCalculations.calculateLPReward(
            poolData,
            lpStakes,
            poolLPs,
            poolId,
            user,
            userLPStake,
            remainingStakes
        );
    }
    function _calculateBettorPayout(uint256 poolId, address user) internal returns (uint256) {
        Pool memory pool = pools[poolId];
        uint256 stake = bettorStakes[poolId][user];
        if (stake == 0) return 0;
        
        // Use library for bettor payout calculation
        (, uint256 netPayout, uint256 fee) = ClaimCalculations.calculateBettorPayout(
            stake,
            pool.odds,
            adjustedFeeRate(user)
        );
        
        if (fee > 0) {
            address creator = pool.creator;
            
            // Fee Distribution:
            // - Creator: 20% (stored separately, claimable via claimCreatorFees())
            // - Platform: 80% (stored in totalCollectedBNB/Prix, distributed via distributeFees())
            //   Platform's 80% is further split:
            //   - Stakers: 30% of platform = 24% of total fees
            //   - FeeCollector: 70% of platform = 56% of total fees
            uint256 creatorShare = (fee * 20) / 100;
            uint256 platformShare = fee - creatorShare;
            
            if (_poolUsesPrix(poolId)) {
                totalCollectedPrix += platformShare;
                poolCollectedFeesPrix[poolId] += platformShare;
                creatorPendingFeesPrix[creator] += creatorShare;
                emit CreatorFeeAccrued(poolId, creator, 0, creatorShare);
            } else {
                totalCollectedBNB += platformShare;
                poolCollectedFeesBNB[poolId] += platformShare;
                creatorPendingFeesBNB[creator] += creatorShare;
                emit CreatorFeeAccrued(poolId, creator, creatorShare, 0);
            }
        }
        
        uint256 minValueBNB = 20 * 1e18; // 20 BNB
        uint256 minValuePrix = 20000 * 1e18; // 20K Prix
        bool isHighValue = _poolUsesPrix(poolId) ? (stake >= minValuePrix) : (stake >= minValueBNB);
        
        if (isHighValue) {
            // High-value bettor win: +8 points
            emit ReputationActionOccurred(user, ReputationSystem.ReputationAction.BET_WON_HIGH_VALUE, stake, bytes32(poolId), block.timestamp);
        } else {
            // Low-value bettor win: +3 points
            emit ReputationActionOccurred(user, ReputationSystem.ReputationAction.BET_WON, stake, bytes32(poolId), block.timestamp);
        }
        
        return netPayout;
    }
    function claim(uint256 poolId) external validPool(poolId) nonReentrant {
        require(_isPoolSettled(poolId));
        require(!claimed[poolId][msg.sender]);
        
        uint256 payout;
        Pool memory pool = pools[poolId];
        
        bool creatorWon = ClaimCalculations.creatorSideWon(pool.predictedOutcome, pool.result);
        
        if (creatorWon) {
            // Handle creator claims (priority)
            if (msg.sender == pool.creator) {
                // Ensure creator has stake to claim
                require(pool.creatorStake > 0);
                
                // Use library for creator calculation
                ClaimCalculations.PoolData memory poolData = ClaimCalculations.PoolData({
                    odds: pool.odds,
                    creatorStake: pool.creatorStake,
                    totalCreatorSideStake: pool.totalCreatorSideStake,
                    totalBettorStake: pool.totalBettorStake
                });
                
                payout = ClaimCalculations.calculateCreatorClaim(poolData);
                
                // ✅ Reputation: Creator wins
                uint256 minValueBNB = 20 * 1e18; // 20 BNB
                uint256 minValuePrix = 20000 * 1e18; // 20K Prix
                bool isHighValue = _poolUsesPrix(poolId) ? 
                    (pool.creatorStake >= minValuePrix) : (pool.creatorStake >= minValueBNB);
                
                if (isHighValue) {
                    // High-value creator win: +8 points
                    emit ReputationActionOccurred(pool.creator, ReputationSystem.ReputationAction.CREATOR_WON_HIGH_VALUE, pool.creatorStake, bytes32(poolId), block.timestamp);
                } else {
                    // Low-value creator win: +5 points
                    emit ReputationActionOccurred(pool.creator, ReputationSystem.ReputationAction.CREATOR_WON, pool.creatorStake, bytes32(poolId), block.timestamp);
                }
            } else {
                // LP provider claims with FIFO logic - ensure they have LP stake
                require(lpStakes[poolId][msg.sender] > 0);
                payout = _calculateLPPayoutWithFIFO(poolId, msg.sender);
            }
        } else {
            // Bettor wins: Bettor Stake * Odds - ensure they have bettor stake
            require(bettorStakes[poolId][msg.sender] > 0);
            payout = _calculateBettorPayout(poolId, msg.sender);
        }
        
        require(payout > 0);
        claimed[poolId][msg.sender] = true;
        
        if (_poolUsesPrix(poolId)) {
            require(prixToken.transfer(msg.sender, payout));
        } else {
            (bool success, ) = payable(msg.sender).call{value: payout}("");
            require(success);
        }
        
        emit RewardClaimed(poolId, msg.sender, payout);
    }
    function adjustedFeeRate(address user) public view returns (uint256) {
        return PoolStats.getAdjustedFeeRate(prixToken.balanceOf(user), platformFee);
    }
    function claimCreatorFees() external nonReentrant {
        uint256 bnbAmount = creatorPendingFeesBNB[msg.sender];
        uint256 prixAmount = creatorPendingFeesPrix[msg.sender];
        require(bnbAmount > 0 || prixAmount > 0, "No fees to claim");
        
        if (bnbAmount > 0) {
            creatorPendingFeesBNB[msg.sender] = 0;
            (bool success, ) = payable(msg.sender).call{value: bnbAmount}("");
            require(success, "BNB transfer failed");
        }
        
        if (prixAmount > 0) {
            creatorPendingFeesPrix[msg.sender] = 0;
            require(prixToken.transfer(msg.sender, prixAmount), "Prix transfer failed");
        }
        
        emit CreatorFeeClaimed(msg.sender, bnbAmount, prixAmount);
    }
    function getCreatorPendingFees(address creator) external view returns (uint256 bnbAmount, uint256 prixAmount) {
        return (creatorPendingFeesBNB[creator], creatorPendingFeesPrix[creator]);
    }
    function distributeFees(address stakingContract) external nonReentrant {
        require(msg.sender == feeCollector);
        require(stakingContract != address(0), "Invalid staking contract");
        
        // Note: totalCollectedBNB/Prix contains only the platform's 80% share
        // (Creator's 20% is stored separately in creatorPendingFeesBNB/Prix)
        // 
        // Distribution of platform's 80%:
        // - Stakers: 30% of platform = 24% of original total fees
        // - FeeCollector: 70% of platform = 56% of original total fees
        
        uint256 _bnb = totalCollectedBNB;
        uint256 _prix = totalCollectedPrix;
        uint256 bnbStakers = 0;
        uint256 prixStakers = 0;
        
        if (_bnb > 0) {
            bnbStakers = (_bnb * 30) / 100;  // 30% of platform's 80% = 24% of total
            uint256 bnbFeeCollector = _bnb - bnbStakers;  // 70% of platform's 80% = 56% of total
            totalCollectedBNB = 0;
            (bool success1, ) = payable(feeCollector).call{value: bnbFeeCollector}("");
            require(success1, "FeeCollector BNB transfer failed");
            (bool success2, ) = payable(stakingContract).call{value: bnbStakers}("");
            require(success2, "Staking contract BNB transfer failed");
        }
        
        if (_prix > 0) {
            prixStakers = (_prix * 30) / 100;  // 30% of platform's 80% = 24% of total
            uint256 prixFeeCollector = _prix - prixStakers;  // 70% of platform's 80% = 56% of total
            totalCollectedPrix = 0;
            require(prixToken.transfer(feeCollector, prixFeeCollector), "FeeCollector Prix transfer failed");
            require(prixToken.transfer(stakingContract, prixStakers), "Staking contract Prix transfer failed");
        }
        
        if (_bnb > 0 || _prix > 0) {
            // Notify staking contract of revenue (for staker rewards)
            IPredinexStaking(stakingContract).addRevenue(prixStakers, bnbStakers);
        }
    }
    function addToWhitelist(uint256 poolId, address user) external validPool(poolId) {
        require(msg.sender == pools[poolId].creator);
        poolWhitelist[poolId][user] = true;
        emit UserWhitelisted(poolId, user);
    }
    function removeFromWhitelist(uint256 poolId, address user) external validPool(poolId) {
        require(msg.sender == pools[poolId].creator);
        poolWhitelist[poolId][user] = false;
    }
    function refundPool(uint256 poolId) external nonReentrant validPool(poolId) {
        Pool storage pool = pools[poolId];
        require(!_isPoolSettled(poolId));
        require(!_isPoolRefunded(poolId), "Pool already refunded");
        require(block.timestamp > pool.arbitrationDeadline);
        uint256 totalParticipants = poolLPs[poolId].length + poolBettors[poolId].length;
        if (totalParticipants > REFUND_BATCH_SIZE) {
            pool.flags |= 1; // Mark as settled
            pool.flags |= 32; // Mark as refunded
            emit PoolRefunded(poolId, "Use batchRefund for large pools");
            return;
        }
        pool.flags |= 1; // Mark as settled
        pool.flags |= 32; // Mark as refunded 
        address[] memory lps = poolLPs[poolId];
        uint256 lpCount = lps.length;
        bool usePrix = _poolUsesPrix(poolId);
        for (uint256 i = 0; i < lpCount; ) {
            address lp = lps[i];
            uint256 stake = lpStakes[poolId][lp];
            if (stake > 0) {
                if (usePrix) {
                    require(prixToken.transfer(lp, stake));
                } else {
                    (bool success, ) = payable(lp).call{value: stake}("");
                    require(success);
                }
            }
            unchecked { ++i; } 
        }
        address[] memory bettors = poolBettors[poolId];
        uint256 bettorCount = bettors.length;
        for (uint256 i = 0; i < bettorCount; ) {
            address bettor = bettors[i];
            uint256 stake = bettorStakes[poolId][bettor];
            if (stake > 0) {
                if (usePrix) {
                    require(prixToken.transfer(bettor, stake));
                } else {
                    (bool success, ) = payable(bettor).call{value: stake}("");
                    require(success);
                }
            }
            unchecked { ++i; } 
        }
        // Refund creator stake
        if (pool.creatorStake > 0) {
            if (usePrix) {
                require(prixToken.transfer(pool.creator, pool.creatorStake));
            } else {
                (bool success, ) = payable(pool.creator).call{value: pool.creatorStake}("");
                require(success, "Creator refund failed");
            }
            emit RewardClaimed(poolId, pool.creator, pool.creatorStake);
        }
        _removePoolFromCreatorActiveList(poolId);
        emit PoolRefunded(poolId, "Arbitration timeout");
    }
    function batchRefund(
        uint256 poolId, 
        uint256 startIndex, 
        uint256 batchSize
    ) external nonReentrant validPool(poolId) {
        require(_isPoolSettled(poolId));
        require(_isPoolRefunded(poolId), "Pool not marked for refund");
        Pool storage pool = pools[poolId];
        require(block.timestamp > pool.arbitrationDeadline);
        require(batchSize <= REFUND_BATCH_SIZE);
        bool usePrix = _poolUsesPrix(poolId);
        uint256 processed = 0;
        uint256 lpCount = poolLPs[poolId].length;
        if (startIndex < lpCount) {
            address[] storage lps = poolLPs[poolId];
            uint256 lpEndIndex = startIndex + batchSize > lpCount ? lpCount : startIndex + batchSize;
            for (uint256 i = startIndex; i < lpEndIndex && processed < batchSize; ) {
                address lp = lps[i];
                uint256 stake = lpStakes[poolId][lp];
                if (stake > 0 && !claimed[poolId][lp]) {
                    claimed[poolId][lp] = true; 
                    if (usePrix) {
                        require(prixToken.transfer(lp, stake));
                    } else {
                        (bool success, ) = payable(lp).call{value: stake}("");
                        require(success);
                    }
                    emit RewardClaimed(poolId, lp, stake);
                    processed++;
                }
                unchecked { ++i; }
            }
            return; 
        }
        uint256 bettorStartIndex = startIndex - lpCount;
        uint256 bettorCount = poolBettors[poolId].length;
        require(bettorStartIndex < bettorCount);
        address[] storage bettors = poolBettors[poolId];
        uint256 bettorEndIndex = bettorStartIndex + batchSize > bettorCount ? bettorCount : bettorStartIndex + batchSize;
        for (uint256 i = bettorStartIndex; i < bettorEndIndex && processed < batchSize; ) {
            address bettor = bettors[i];
            uint256 stake = bettorStakes[poolId][bettor];
            if (stake > 0 && !claimed[poolId][bettor]) {
                claimed[poolId][bettor] = true; 
                if (usePrix) {
                    require(prixToken.transfer(bettor, stake));
                } else {
                    (bool success, ) = payable(bettor).call{value: stake}("");
                    require(success);
                }
                emit RewardClaimed(poolId, bettor, stake);
                processed++;
            }
            unchecked { ++i; }
        }
        if (bettorStartIndex + batchSize >= bettorCount) {
            pools[poolId].flags |= 32; // Mark as refunded when batch is completed
            _removePoolFromCreatorActiveList(poolId);
            emit PoolRefunded(poolId, "Batch refund completed");
        }
    }
    function getPool(uint256 poolId) external view validPool(poolId) returns (Pool memory) {
        return pools[poolId];
    }
    function getActivePoolsPaginated(
        uint256 offset, 
        uint256 limit
    ) external view returns (
        uint256[] memory poolIds, 
        uint256 totalCount
    ) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < poolCount; ) {
            if (!_isPoolSettled(i) && block.timestamp < pools[i].bettingEndTime) {
                activeCount++;
            }
            unchecked { ++i; }
        }
        totalCount = activeCount;
        if (offset >= activeCount || limit == 0) {
            return (new uint256[](0), totalCount);
        }
        uint256 returnSize = limit;
        if (offset + limit > activeCount) {
            returnSize = activeCount - offset;
        }
        poolIds = new uint256[](returnSize);
        uint256 currentIndex = 0;
        uint256 resultIndex = 0;
        for (uint256 i = 0; i < poolCount && resultIndex < returnSize; ) {
            if (!_isPoolSettled(i) && block.timestamp < pools[i].bettingEndTime) {
                if (currentIndex >= offset) {
                    poolIds[resultIndex] = i;
                    resultIndex++;
                }
                currentIndex++;
            }
            unchecked { ++i; }
        }
        return (poolIds, totalCount);
    }
    function getPoolsByCreator(address creator, uint256 limit) external view returns (uint256[] memory) {
        uint256[] storage creatorPools = creatorActivePools[creator];
        if (limit == 0 || limit > creatorPools.length) limit = creatorPools.length;
        uint256[] memory result = new uint256[](limit);
        for (uint256 i = 0; i < limit; ) {
            result[i] = creatorPools[i];
            unchecked { ++i; }
        }
        return result;
    }
    function poolExists(uint256 poolId) external view returns (bool) {
        return poolId < poolCount;
    }
    function updateStreak(address user, bool won) external {
        require(msg.sender == address(this) || msg.sender == owner());
        if (won) {
            predictionStreaks[user]++;
            if (predictionStreaks[user] > longestStreak[user]) {
                longestStreak[user] = predictionStreaks[user];
            }
            streakMultiplier[user] = calculateStreakMultiplier(predictionStreaks[user]);
        } else {
            predictionStreaks[user] = 0;
            streakMultiplier[user] = 1;
        }
    }
    function calculateStreakMultiplier(uint256 streak) internal pure returns (uint256) {
        if (streak >= 20) return 5;
        if (streak >= 10) return 3;
        if (streak >= 5) return 2;
        return 1;
    }
    function _isPoolSettled(uint256 poolId) internal view returns (bool) {
        return (pools[poolId].flags & 1) != 0;
    }
    function _isPoolPrivate(uint256 poolId) internal view returns (bool) {
        return (pools[poolId].flags & 4) != 0;
    }
    function _poolUsesPrix(uint256 poolId) internal view returns (bool) {
        return (pools[poolId].flags & 8) != 0;
    }
    function _isPoolFilledAbove60(uint256 poolId) internal view returns (bool) {
        return (pools[poolId].flags & 16) != 0;
    }
    function _isPoolRefunded(uint256 poolId) internal view returns (bool) {
        return (pools[poolId].flags & 32) != 0;
    }
    function _removePoolFromCreatorActiveList(uint256 poolId) internal {
        address creator = pools[poolId].creator;
        uint256[] storage activePools = creatorActivePools[creator];
        uint256 index = poolIdToCreatorIndex[poolId];
        if (index < activePools.length && activePools[index] == poolId) {
            uint256 lastIndex = activePools.length - 1;
            if (index != lastIndex) {
                uint256 lastPoolId = activePools[lastIndex];
                activePools[index] = lastPoolId;
                poolIdToCreatorIndex[lastPoolId] = index;
            }
            activePools.pop();
            delete poolIdToCreatorIndex[poolId];
        }
    }
    function _updatePoolAnalytics(uint256 poolId, uint256 amount, uint256 newParticipants) internal {
        PoolAnalytics storage analytics = poolAnalytics[poolId];
        analytics.totalVolume += amount;
        analytics.participantCount += newParticipants;
        analytics.lastActivityTime = block.timestamp;
        if (analytics.participantCount > 0) {
            analytics.averageBetSize = analytics.totalVolume / analytics.participantCount;
        }
        Pool memory pool = pools[poolId];
        if (pool.maxBettorStake > 0) {
            analytics.fillPercentage = (pool.totalBettorStake * 100) / pool.maxBettorStake;
        }
        analytics.liquidityRatio = pool.totalCreatorSideStake > 0 ? 
            (pool.totalBettorStake * 100) / pool.totalCreatorSideStake : 100;
        analytics.isHotPool = analytics.participantCount >= 10 && 
            block.timestamp - analytics.lastActivityTime < 1 hours;
        emit AnalyticsUpdated(poolId, analytics.totalVolume, analytics.participantCount);
    }
    function _updateCreatorStats(address creator, uint256 amount, bool isNewPool) internal {
        CreatorStats storage stats = creatorStats[creator];
        if (isNewPool) {
            stats.totalPoolsCreated++;
            stats.activePoolsCount++;
        }
        stats.totalVolumeGenerated += amount;
        if (stats.totalPoolsCreated > 0) {
            stats.averagePoolSize = stats.totalVolumeGenerated / stats.totalPoolsCreated;
        }
        if (address(reputationSystem) != address(0)) {
            (uint256 reputation,,,) = reputationSystem.getReputationBundle(creator);
            stats.reputationScore = reputation;
        }
    }
    function _updateGlobalStats(uint256 amount, bool isNewPool) internal {
        if (isNewPool) {
            globalStats.totalPools++;
        }
        globalStats.totalVolume += amount;
        globalStats.lastUpdated = block.timestamp;
        if (globalStats.totalPools > 0) {
            globalStats.averagePoolSize = globalStats.totalVolume / globalStats.totalPools;
        }
    }
    // Removed analytics/stats functions - backend handles via:
    // - getGlobalStats() -> /api/unified-stats
    // - getPoolAnalytics() -> /api/pool-analytics/:poolId
    // - getCreatorReputation() -> /api/leaderboards/creators
    // - getPotentialWinnings() -> calculate off-chain
    // - getParticipantCounts() -> backend syncs via event-driven-pool-sync
    // - isParticipant() -> backend syncs via event-driven-bet-sync
    // - getUserPoolStake() -> backend syncs via event-driven-bet-sync
    // Removed getBatchRefundInfo - calculate directly if needed
}

