// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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

// contracts/PredinexPoolFactory.sol

contract PredinexPoolFactory is Ownable {
    address public poolCore;
    address public boostSystem;

    struct PoolWithBoost {
        uint256 poolId;
        uint8 boostTier;
        uint256 boostExpiry;
    }

    mapping(uint256 => PoolWithBoost) public poolsWithBoost;
    uint256[] public boostedPools;

    event PoolCreatedWithBoost(uint256 indexed poolId, uint8 boostTier);
    event BatchPoolsCreated(uint256[] poolIds);

    constructor(address _poolCore, address _boostSystem) Ownable(msg.sender) {
        require(_poolCore != address(0), "Invalid pool core address");
        require(_boostSystem != address(0), "Invalid boost system address");
        poolCore = _poolCore;
        boostSystem = _boostSystem;
    }

    function createPoolWithBoost(
        uint256 poolId,
        uint8 boostTier
    ) external onlyOwner {
        require(poolId >= 0, "Invalid pool ID");
        require(boostTier > 0 && boostTier <= 3, "Invalid boost tier");

        uint256 boostExpiry = block.timestamp + 7 days;

        poolsWithBoost[poolId] = PoolWithBoost({
            poolId: poolId,
            boostTier: boostTier,
            boostExpiry: boostExpiry
        });

        boostedPools.push(poolId);

        emit PoolCreatedWithBoost(poolId, boostTier);
    }

    function getBoostedPools() external view returns (uint256[] memory) {
        return boostedPools;
    }

    function getPoolBoostInfo(uint256 poolId) external view returns (uint8 tier, uint256 expiry) {
        PoolWithBoost memory pool = poolsWithBoost[poolId];
        if (pool.boostExpiry <= block.timestamp) {
            return (0, 0);
        }
        return (pool.boostTier, pool.boostExpiry);
    }

    function setPoolCore(address _poolCore) external onlyOwner {
        require(_poolCore != address(0), "Invalid address");
        poolCore = _poolCore;
    }

    function setBoostSystem(address _boostSystem) external onlyOwner {
        require(_boostSystem != address(0), "Invalid address");
        boostSystem = _boostSystem;
    }
}
