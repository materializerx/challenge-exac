//SPDX-License-Identifier: MIT
pragma solidity >=0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import "hardhat/console.sol";

/**
 * @title An implementation of ETH Reward Pool for Exactly Finance Smart Contract Challenge
 * @author materializerX
 */

contract ETHPool is Ownable {
    using Address for address payable;

    /// @dev RewardSnapshotAt struct, containing snapshot of the total deposit balance when a new reward is deposited.
    struct RewardSnapshotAt {
        uint256 totalDepositBalance;
        uint256 reward;
    }

    /// @dev UserAccount struct containing deposit and claimable reward calculation index and amount.
    struct UserAccount {
        uint256 depositAmount;
        uint256 claimableReward;
        uint256 rewardIndex;
    }

    /// @dev Total deposits from all users
    uint256 public totalDepositBalance;

    /// @dev Total rewards in the pool
    uint256 public rewardPoolBalance;

    /// @dev Index of the last reward added
    uint256 public lastRewardSnapshotIndex;

    /// @dev Snapshots of each reward added, used to compute claimable rewards.
    RewardSnapshotAt[] public rewardSnapshots;

    /// @dev Mapping between addresses and it's user account information.
    mapping(address => UserAccount) public userAccounts;

    /// @dev Emitted when a user withdraws it's deposit with claimable rewards.
    event Withdrawal(address account, uint256 amount);

    /// @dev Emitted when a user adds a deposit.
    event Deposit(address account, uint256 amount);

    /// @dev Emitted when the owner(Team) adds new reward.
    event RewardAdded(address account, uint256 amount);

    /**
     * @dev Computes claimable reward amount to the user `account` from newly added rewards.
     *
     * @param addr The user account address.
     */
    function computeClaimableReward(address addr) public returns (uint256) {
        uint256 claimableRewards;
        uint256 _userRewardIndex = userAccounts[addr].rewardIndex;
        uint256 _deposit = userAccounts[addr].depositAmount;
        uint256 _lastAddedRewardIndex = lastRewardSnapshotIndex;

        // check if there is no claimable reward to be calculated.
        if (_userRewardIndex == _lastAddedRewardIndex) {
            return 0;
        }

        // compute all new rewards added to the user
        for (uint256 i = _userRewardIndex; i < _lastAddedRewardIndex; i++) {
            claimableRewards += (_deposit * rewardSnapshots[i].reward) / rewardSnapshots[i].totalDepositBalance;
        }

        // update reward pool balance
        if (claimableRewards > 0) {
            rewardPoolBalance -= claimableRewards;
        }

        return claimableRewards;
    }

    /**
    * @dev Update total deposit amount and calculate claimable rewards to the user.
    *
    * @notice Deposit funds for the user.
    *
    * Emits a {Deposit} event.

    * Requirements:
    *
    * - msg.value should be greater than ZERO. 
    *
    */
    function deposit() external payable {
        require(msg.value > 0, "Error: deposit amount is zero");

        // calculate the claimable reward amount corresponding to the user `msg.sender` for newly added rewards.
        userAccounts[msg.sender].claimableReward += computeClaimableReward(msg.sender);

        // update total user deposit amount adding this deposit amount `msg.value`.
        userAccounts[msg.sender].depositAmount += msg.value;

        // update total deposit balance.
        totalDepositBalance += msg.value;

        // update reward index which means all claimable reward till this point has been calculated.
        userAccounts[msg.sender].rewardIndex = lastRewardSnapshotIndex;

        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @dev Add new reward with balance snapshot at this moment.
     *
     * @notice Deposit reward by Owner.
     *
     * Emits a {RewardAdded} event.
     *
     * Requirements:
     *
     * - msg.sender should be Owner of the contract.
     * - msg.value should be greater than ZERO.
     */
    function depositReward() public payable onlyOwner {
        require(msg.value > 0, "Error: deposit amount is zero");

        // add new reward with balance snapshot.
        rewardSnapshots.push(RewardSnapshotAt({ totalDepositBalance: totalDepositBalance, reward: msg.value }));

        // update reward pool balance.
        rewardPoolBalance += msg.value;

        // update index for last reward snapshot.
        lastRewardSnapshotIndex++;

        emit RewardAdded(msg.sender, msg.value);
    }

    /**
     * @dev Withdraw all deposit amount with corresponding rewards for msg.sender.
     *
     * @notice Withdraw all deposit amount with corresponding rewards for msg.sender.
     *
     * Emits a {Withdrawal} event.
     *
     * Requirements:
     *
     * - msg.sender should have a deposit balance greater than ZERO.
     */
    function withdraw() external {
        uint256 _deposit = userAccounts[msg.sender].depositAmount;
        require(_deposit > 0, "Error: deposit amount is zero");

        // compute claimable reward amount.
        uint256 claimableRewards = userAccounts[msg.sender].claimableReward + computeClaimableReward(msg.sender);

        // clear balance information.
        delete userAccounts[msg.sender];

        // substract from total balance the amount that is withdrawn to the user
        totalDepositBalance -= _deposit;

        emit Withdrawal(msg.sender, _deposit + claimableRewards);

        // https://diligence.consensys.net/blog/2019/09/stop-using-soliditys-transfer-now/
        payable(msg.sender).sendValue(_deposit + claimableRewards);
    }
}
