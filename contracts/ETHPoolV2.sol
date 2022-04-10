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

    //@TODO: change to private
    // available rewards amount
    uint256 public _rewardsPool;
    // available deposit amount
    uint256 public _depositPool;
    // amount that reward cannot be calculated yet
    uint256 public _notYetRewardableAmount;
    // amount from which reward can be calculated
    uint256 public _rewardableAmount;

    struct User {
        uint256 claimableDepositAmount;
        // reward will be calculated from this value
        uint256 rewardCalculableAmount;
        uint256 claimableRewards;
        uint256 lastDepositTime;
    }

    uint256 public lastRewardDepositTime;

    mapping(address => User) public accounts;

    function totalDepositBalance() public view returns (uint256) {
        return _depositPool;
    }

    function rewardPoolBalance() public view returns (uint256) {
        return _rewardsPool;
    }

    modifier updateReward(address account) {
        // check if there are any deposit made before last reward has been deposited
        if (accounts[msg.sender].lastDepositTime > 0 && accounts[msg.sender].lastDepositTime <= lastRewardDepositTime) {
            uint256 userBalanceToCalcReward = accounts[msg.sender].rewardCalculableAmount;
            // check if there is a balance to calculate the claimable reward
            // if it is ZERO, there is no claimable reward to be calculated
            if (_rewardableAmount > 0) {
                uint256 claimableRewards = (userBalanceToCalcReward * _rewardsPool) / _rewardableAmount;
                // take out calculated claimable reward amount from the rewards pool
                _rewardsPool -= claimableRewards;
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

    function deposit() external payable updateReward(msg.sender) {
        accounts[msg.sender].rewardCalculableAmount += msg.value;
        accounts[msg.sender].lastDepositTime = block.timestamp;
        _depositPool += msg.value;
        _notYetRewardableAmount += msg.value;
    }

    function depositReward() external payable onlyOwner {
        _rewardsPool += msg.value;
        lastRewardDepositTime = block.timestamp;
        // everytime a reward is deposited, amount become available to calculate reward
        _rewardableAmount += _notYetRewardableAmount;
        // reset the value because _notYetRewardableAmount is now available to calculate reward
        _notYetRewardableAmount = 0;
    }

    function withdraw() external payable updateReward(msg.sender) {
        uint256 claimableDepositAmount = accounts[msg.sender].claimableDepositAmount;
        uint256 claimableRewards = accounts[msg.sender].claimableRewards;
        uint256 notRewardedBalance = accounts[msg.sender].rewardCalculableAmount;

        delete accounts[msg.sender];

        _depositPool = _depositPool - notRewardedBalance - claimableDepositAmount;

        // https://diligence.consensys.net/blog/2019/09/stop-using-soliditys-transfer-now/
        payable(msg.sender).sendValue(claimableDepositAmount + claimableRewards + notRewardedBalance);
    }
}
