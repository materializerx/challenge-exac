//SPDX-License-Identifier: MIT
pragma solidity >=0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title An implementation of ETH Reward Pool for Exactly Finance Smart Contract Challenge
 * @author materializerX
 */

contract ETHPoolV2 is Ownable {
    using Address for address payable;

    /// @dev UserAccount struct containing deposit&reward amount and reward calculation information
    struct User {
        uint256 claimableDepositAmount;
        uint256 claimableRewards;
        // reward will be calculated from this value
        uint256 rewardCalculableAmount;
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
            // deposit amount to calculate the this user's reward share
            uint256 userBalanceToCalcReward = accounts[msg.sender].rewardCalculableAmount;
            // rewards corresponding to user's deposit amount
            uint256 claimableRewards = (userBalanceToCalcReward * rewardsPool) / _rewardableAmount;
            // take out calculated claimable reward amount from the rewards pool
            rewardsPool -= claimableRewards;
            // accumulate claimable rewards
            accounts[msg.sender].claimableRewards += claimableRewards;
            // balance pending to be rewarded is now became claimable balance
            accounts[msg.sender].claimableDepositAmount += userBalanceToCalcReward;
            // reward has been calculated, there are no more balance pending to be rewarded
            accounts[msg.sender].rewardCalculableAmount = 0;
            // _rewardableAmount is the denominator, so it should be decremented by this userBalanceToCalcReward
            _rewardableAmount -= userBalanceToCalcReward;
        }

        _;
    }

    /**
     * @dev Checks if the `amount` is greater than ZERO.
     *
     * @param amount The deposit amount.
     */
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
        // everytime a reward is deposited, the deposit amount that was not yet available to calculate reward
        // becomes now available to calculate the reward
        _rewardableAmount += _notYetRewardableAmount;
        // reset the value because _notYetRewardableAmount is now available to calculate reward
        _notYetRewardableAmount = 0;

        emit RewardAdded(msg.sender, msg.value);
    }

    /**
     * @dev Withdraw all deposit amount with corresponding rewards to msg.sender.
     *
     * @notice Withdraw all deposit amount with corresponding rewards to msg.sender.
     *
     * Emits a {Withdrawal} event.
     *
     * Requirements:
     *
     * - msg.sender should have a withdrawable balance greater than ZERO.
     */
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
