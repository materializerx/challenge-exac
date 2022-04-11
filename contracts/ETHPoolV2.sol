//SPDX-License-Identifier: MIT
pragma solidity >=0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

// import "hardhat/console.sol";

/**
 * @title An implementation of ETH Reward Pool for Exactly Finance Smart Contract Challenge
 * @author materializerX
 */

contract ETHPoolV2 is Ownable {
    using Address for address payable;

    /// @dev UserAccount struct containing deposit and claimable reward calculation index and amount.
    struct User {
        uint256 claimableDepositAmount;
        // reward will be calculated from this value
        uint256 rewardCalculableAmount;
        uint256 claimableRewards;
        uint256 lastDepositTime;
    }
    /// @dev Available rewards amount
    uint256 public rewardsPool;
    /// @dev Available deposit amount
    uint256 public depositPool;
    /// @dev Amount that reward has not been calculated yet
    uint256 private _notYetRewardableAmount;
    /// @dev Amount from which reward can be calculated
    uint256 private _rewardableAmount;
    /// @dev Last time the reward was deposited
    uint256 private lastRewardDepositTime;

    /// @dev Mapping between addresses and it's user account information.
    mapping(address => User) public accounts;

    /// @dev Emitted when a user withdraws it's deposit with claimable rewards.
    event Withdrawal(address account, uint256 amount);

    /// @dev Emitted when a user adds a deposit.
    event Deposit(address account, uint256 amount);

    /// @dev Emitted when the owner(Team) adds new reward.
    event RewardAdded(address account, uint256 amount);

    /**
     * @dev Computes claimable reward amount to the user `account`.
     *
     * @param account The user account address.
     */
    modifier updateReward(address account) {
        // check if there are any deposit made before last reward has been deposited
        if (accounts[msg.sender].lastDepositTime > 0 && accounts[msg.sender].lastDepositTime <= lastRewardDepositTime) {
            uint256 userBalanceToCalcReward = accounts[msg.sender].rewardCalculableAmount;
            // check if there is a balance to calculate the claimable reward
            // if it is ZERO, there is no claimable reward to be calculated
            if (_rewardableAmount > 0) {
                uint256 claimableRewards = (userBalanceToCalcReward * rewardsPool) / _rewardableAmount;
                // take out calculated claimable reward amount from the rewards pool
                rewardsPool -= claimableRewards;
                // accumulate claimable rewards
                accounts[msg.sender].claimableRewards += claimableRewards;
                // balance pending to be rewarded is now became claimable balance
                accounts[msg.sender].claimableDepositAmount += userBalanceToCalcReward;
                // reward has been calculated, there are no more balance pending to be rewarded
                accounts[msg.sender].rewardCalculableAmount = 0;
                // _rewardableAmount is the denominator, so it should be decremented by this userNotRewardedBalance
                _rewardableAmount -= userBalanceToCalcReward;
            }
        }

        _;
    }

    modifier amountNotZero(uint256 amount) {
        require(amount > 0, "Error: deposit amount is ZERO");
        _;
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
    function deposit() external payable amountNotZero(msg.value) updateReward(msg.sender) {
        accounts[msg.sender].rewardCalculableAmount += msg.value;
        accounts[msg.sender].lastDepositTime = block.timestamp;
        depositPool += msg.value;
        _notYetRewardableAmount += msg.value;

        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @dev Add new reward.
     *
     * @notice Deposit reward by Owner.
     *
     * Emits a {RewardAdded} event.
     *
     * Requirements:
     *
     * - msg.sender should be Owner(Team) of the contract.
     * - msg.value should be greater than ZERO.
     */
    function depositReward() external payable onlyOwner amountNotZero(msg.value) {
        rewardsPool += msg.value;
        lastRewardDepositTime = block.timestamp;
        // everytime a reward is deposited, amount that was not a available to calculate reward
        // becomes available to calculate reward
        _rewardableAmount += _notYetRewardableAmount;
        // reset the value because _notYetRewardableAmount is now available to calculate reward
        _notYetRewardableAmount = 0;

        emit RewardAdded(msg.sender, msg.value);
    }

    function withdraw() external payable updateReward(msg.sender) {
        uint256 claimableDepositAmount = accounts[msg.sender].claimableDepositAmount;
        uint256 claimableRewards = accounts[msg.sender].claimableRewards;
        uint256 notRewardedBalance = accounts[msg.sender].rewardCalculableAmount;
        uint256 totalWithdrawable = claimableDepositAmount + claimableRewards + notRewardedBalance;

        require(totalWithdrawable > 0, "Error: withdrawable amount is ZERO");

        // clear balance information.
        delete accounts[msg.sender];

        // update deposit pool substracting deposit amount that is withdrawn to the user
        depositPool = depositPool - notRewardedBalance - claimableDepositAmount;

        emit Withdrawal(msg.sender, totalWithdrawable);

        // https://diligence.consensys.net/blog/2019/09/stop-using-soliditys-transfer-now/
        payable(msg.sender).sendValue(totalWithdrawable);
    }
}
