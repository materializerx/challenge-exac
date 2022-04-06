import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
// import { Signers } from "./types";
import { expect } from "chai";
import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";

import type { ETHPool } from "../../src/types/contracts/ETHPool";

// import { ETHPool__factory } from "../src/types";

const BN = ethers.BigNumber;
// const Decimals = BN.from(18);
// const ETH = BN.from(10).pow(Decimals);

let team: SignerWithAddress;
let userA: SignerWithAddress;
let userB: SignerWithAddress;
let treasury: SignerWithAddress;

describe("ETH Pool Unit tests", async () => {
  let ethPool: ETHPool;

  const signers: SignerWithAddress[] = await ethers.getSigners();
  team = signers[0];
  userA = signers[1];
  userB = signers[2];
  treasury = signers[19];

  // describe("about requirements", async () => {
  //   it("should revert when depositing 0 ETH", async function () {
  //     await expect(ethPool.connect(userA).deposit({value: ETH.mul(0)})).to.be.revertedWith("deposit amount is 0");
  //   });
  // });

  describe(`A deposits 100, and B deposits 300 for a total of 400 in the pool. 
  Now A has 25% of the pool and B has 75%. 
  When T deposits 200 rewards, A should be able to withdraw 150 and B 450.
  +------+-----------+--------+--------+------+---------+------------------+
  | Time | Operation | User A | User B | Team | Balance | Remaining Reward |
  +------+-----------+--------+--------+------+---------+------------------+
  |      | Deposit   | 100    |        |      | 100     | 0                |
  +------+-----------+--------+--------+------+---------+------------------+
  | 2    | Deposit   |        | 300    |      | 400     | 0                |
  +------+-----------+--------+--------+------+---------+------------------+
  | 3    | Reward    |        |        | 200  | 400     | 200              |
  +------+-----------+--------+--------+------+---------+------------------+
  | 4    | Withdraw  | 150    |        |      | 300     | 150              |
  +------+-----------+--------+--------+------+---------+------------------+
  | 5    | Withdraw  |        | 450    |      | 0       | 0                |
  +------+-----------+--------+--------+------+---------+------------------+`, async () => {
    before(async function () {
      const ethPoolArtifact: Artifact = await artifacts.readArtifact("ETHPool");
      ethPool = <ETHPool>await waffle.deployContract(team, ethPoolArtifact);
      // set initial account balance to user A, B
      // transfer 0.1 ETH more to be used as transaction fees
      await setBalance(userA, 100.1);
      await setBalance(userB, 300.1);
    });

    // Operation at Time 1
    it("should deposit 100 ETH from User A", async () => {
      // deposit 100 ETH
      const tx = await ethPool.connect(userA).deposit({ value: ethers.utils.parseEther("100.0") });

      // emit `Deposit` event
      expect(tx).to.emit(ethPool, "Deposit");

      // deposit balance is now 100 ETH
      const totalBalance = ethers.utils.formatEther(await ethPool.connect(team).totalDepositBalance());
      expect(totalBalance).to.equal("100.0");
    });

    // Operation at Time 2
    it("should deposit 300 ETH from User B", async () => {
      // User B deposits 300 ETH
      const tx = await ethPool.connect(userB).deposit({ value: ethers.utils.parseEther("300.0") });

      // emit `Deposit` event
      expect(tx).to.emit(ethPool, "Deposit");

      // deposit balance is now 400 ETH
      const totalBalance = ethers.utils.formatEther(await ethPool.connect(team).totalDepositBalance());
      expect(totalBalance).to.equal("400.0");
    });

    // Operation at Time 3
    it("should deposit 200 ETH of Reward from Team", async () => {
      // Team deposits reward of 200 ETH
      const tx = await ethPool.connect(team).depositReward({ value: ethers.utils.parseEther("200.0") });
      const rewardBalance = await ethPool.connect(team).rewardPoolBalance();

      // emit `RewardAdded` event
      expect(tx).to.emit(ethPool, "RewardAdded");

      // deposit balance is now 400 ETH
      const totalBalance = ethers.utils.formatEther(await ethPool.connect(team).totalDepositBalance());
      expect(totalBalance).to.equal("400.0");

      // reward balance is now 200 ETH
      expect(ethers.utils.formatEther(rewardBalance)).to.equal("200.0");
    });

    // Operation at Time 4
    it("should withdraw 150 ETH to user A", async function () {
      // user A withdraws
      const tx = await ethPool.connect(userA).withdraw();

      const userA_Balance = await ethers.provider.getBalance(userA.address);
      const totalBalance = await ethPool.connect(userA).totalDepositBalance();
      const rewardBalance = await ethPool.connect(userA).rewardPoolBalance();

      // emit `Withdrawal` event
      expect(tx).to.emit(ethPool, "Withdrawal");

      // deposit balance is now 300 ETH
      expect(ethers.utils.formatEther(totalBalance)).to.equal("300.0");

      // reward balance is now 150 ETH
      expect(ethers.utils.formatEther(rewardBalance)).to.equal("150.0");

      // userA balance is now 150 ETH
      expect(Number(ethers.utils.formatEther(userA_Balance))).to.closeTo(150, 0.1);
    });

    // Operation at Time 5
    it("should withdraw 450 ETH to user B", async function () {
      // user B withdraws
      const tx = await ethPool.connect(userB).withdraw();

      const userB_Balance = await ethers.provider.getBalance(userB.address);
      const totalBalance = await ethPool.connect(userA).totalDepositBalance();
      const rewardBalance = await ethPool.connect(userA).rewardPoolBalance();

      // emit `Withdrawal` event
      expect(tx).to.emit(ethPool, "Withdrawal");

      // deposit balance is now 0 ETH
      expect(ethers.utils.formatEther(totalBalance)).to.equal("0.0");

      // reward balance is now 0 ETH
      expect(ethers.utils.formatEther(rewardBalance)).to.equal("0.0");

      // userB balance is now 450 ETH
      expect(Number(ethers.utils.formatEther(userB_Balance))).to.closeTo(450, 0.1);
    });
  });

  describe(`When A deposits then T deposits then B deposits then A withdraws and finally B withdraws. 
  A should get their deposit + all the rewards. 
  B should only get their deposit because rewards were sent to the pool before they participated.
  +------+-----------+--------+--------+------+-------------------+------------------+
  | Time | Operation | User A | User B | Team | Remaining Deposit | Remaining Reward |
  +------+-----------+--------+--------+------+-------------------+------------------+
  | 1    | Deposit   | 100    |        |      | 100               | 0                |
  +------+-----------+--------+--------+------+-------------------+------------------+
  | 2    | Reward    |        |        | 200  | 100               | 200              |
  +------+-----------+--------+--------+------+-------------------+------------------+
  | 3    | Deposit   |        | 300    |      | 400               | 200              |
  +------+-----------+--------+--------+------+-------------------+------------------+
  | 4    | Withdraw  | 300    |        |      | 300               | 0                |
  +------+-----------+--------+--------+------+-------------------+------------------+
  | 5    | Withdraw  |        | 300    |      | 0                 | 0                |
  +------+-----------+--------+--------+------+-------------------+------------------+`, async () => {
    before(async () => {
      const ethPoolArtifact: Artifact = await artifacts.readArtifact("ETHPool");
      ethPool = <ETHPool>await waffle.deployContract(team, ethPoolArtifact);
      // set initial account balance to user A, B
      // transfer 0.1 ETH more to be used as transaction fees
      await setBalance(userA, 100.1);
      await setBalance(userB, 300.1);
    });

    // Operation at Time 1
    it("should deposit 100 ETH from User A", async () => {
      // User A deposits 100 ETH
      const tx = await ethPool.connect(userA).deposit({ value: ethers.utils.parseEther("100.0") });

      // emit `Deposit` event
      expect(tx).to.emit(ethPool, "Deposit");

      // total balance is now 100 ETH
      const totalBalance = ethers.utils.formatEther(await ethPool.connect(team).totalDepositBalance());
      expect(totalBalance).to.equal("100.0");
    });

    // Operation at Time 2
    it("should deposit 200 ETH of Reward from Team", async () => {
      // Team deposits a reward of 200 ETH
      const tx = await ethPool.connect(team).depositReward({ value: ethers.utils.parseEther("200.0") });
      const rewardBalance = await ethPool.connect(userA).rewardPoolBalance();

      // emit `RewardAdded` event
      expect(tx).to.emit(ethPool, "RewardAdded");

      // deposit balance is now 300 ETH
      const totalBalance = ethers.utils.formatEther(await ethPool.connect(team).totalDepositBalance());
      expect(totalBalance).to.equal("100.0");

      // reward balance is now 200 ETH
      expect(ethers.utils.formatEther(rewardBalance)).to.equal("200.0");
    });

    // Operation at Time 3
    it("should deposit 300 ETH from User B", async () => {
      // User B deposits 300 ETH
      const tx = await ethPool.connect(userB).deposit({ value: ethers.utils.parseEther("300.0") });

      // emit `Deposit` event
      expect(tx).to.emit(ethPool, "Deposit");

      // deposit balance is now 400 ETH
      const totalBalance = ethers.utils.formatEther(await ethPool.connect(team).totalDepositBalance());
      expect(totalBalance).to.equal("400.0");
    });

    // Operation at Time 4
    it("should withdraw 300 ETH to user A", async function () {
      // user A withdraws
      const tx = await ethPool.connect(userA).withdraw();

      const userA_Balance = await ethers.provider.getBalance(userA.address);
      const totalBalance = await ethPool.connect(userA).totalDepositBalance();
      const rewardBalance = await ethPool.connect(userA).rewardPoolBalance();

      // emit `Withdrawal` event
      expect(tx).to.emit(ethPool, "Withdrawal");

      // deposit balance is now 300 ETH
      expect(ethers.utils.formatEther(totalBalance)).to.equal("300.0");

      // reward balance is now 0 ETH
      expect(ethers.utils.formatEther(rewardBalance)).to.equal("0.0");

      // userA balance is now 300 ETH
      expect(Number(ethers.utils.formatEther(userA_Balance))).to.closeTo(300, 0.1);
    });

    // Operation at Time 5
    it("should withdraw 300 ETH to user B", async function () {
      // user B withdraws
      const tx = await ethPool.connect(userB).withdraw();
      let userB_Balance = await ethers.provider.getBalance(userB.address);
      let totalBalance = await ethPool.connect(userA).totalDepositBalance();
      let rewardBalance = await ethPool.connect(userA).rewardPoolBalance();

      // emit `Withdrawal` event
      expect(tx).to.emit(ethPool, "Withdrawal");

      // deposit balance is now 0 ETH
      expect(ethers.utils.formatEther(totalBalance)).to.equal("0.0");

      // reward balance is now 0 ETH
      expect(ethers.utils.formatEther(rewardBalance)).to.equal("0.0");

      // userB balance is now 300 ETH
      expect(Number(ethers.utils.formatEther(userB_Balance))).to.closeTo(300, 0.1);
    });
  });

  describe(`When there are multiple interleaved deposits from User A and B and consecutive Reward deposits. 
  +------+-----------+-------------------------+------------------+-------------------------+
  |      |           |         Deposit         | Claimable Reward |         Balance         |
  +------+-----------+--------+---------+------+---------+--------+--------+--------+-------+
  | Time | Operation | User A | User B  | Team | User A  | User B | User A | User B | Total |
  +------+-----------+--------+---------+------+---------+--------+--------+--------+-------+
  | 1    | Deposit   | 100    |         |      | 0       | 0      | 100    | 0      | 100   |
  +------+-----------+--------+---------+------+---------+--------+--------+--------+-------+
  | 2    | Deposit   |        | 300     |      | 0       | 0      | 100    | 300    | 400   |
  +------+-----------+--------+---------+------+---------+--------+--------+--------+-------+
  | 3    | Reward    |        |         | 200  | 50      | 150    | 100    | 300    | 400   |
  +------+-----------+--------+---------+------+---------+--------+--------+--------+-------+
  | 4    | Deposit   | 100    |         |      | 50      | 150    | 200    | 300    | 500   |
  +------+-----------+--------+---------+------+---------+--------+--------+--------+-------+
  | 5    | Deposit   |        | 300     |      | 50      | 150    | 200    | 600    | 800   |
  +------+-----------+--------+---------+------+---------+--------+--------+--------+-------+
  | 6    | Deposit   | 200    |         |      | 50      | 150    | 400    | 600    | 1000  |
  +------+-----------+--------+---------+------+---------+--------+--------+--------+-------+
  | 7    | Deposit   |        | 300     |      | 50      | 150    | 400    | 900    | 1300  |
  +------+-----------+--------+---------+------+---------+--------+--------+--------+-------+
  | 8    | Reward    |        |         | 200  | 111.53  | 288.46 | 400    | 900    | 1300  |
  +------+-----------+--------+---------+------+---------+--------+--------+--------+-------+
  | 9    | Reward    |        |         | 300  | 203.83  | 496.15 | 400    | 900    | 1300  |
  +------+-----------+--------+---------+------+---------+--------+--------+--------+-------+
  | 10   | Withdraw  | 603.84 |         |      | 0       | 496.15 | 0      | 900    | 900   |
  +------+-----------+--------+---------+------+---------+--------+--------+--------+-------+
  | 11   | Withdraw  |        | 1396.15 |      | 0       | 0      | 0      | 0      | 0     |
  +------+-----------+--------+---------+------+---------+--------+--------+--------+-------+`, async () => {
    before(async () => {
      const ethPoolArtifact: Artifact = await artifacts.readArtifact("ETHPool");
      ethPool = <ETHPool>await waffle.deployContract(team, ethPoolArtifact);
      // set initial account balance to user A, B
      // transfer 0.1 ETH more to be used as transaction fees
      await setBalance(userA, 400.1);
      await setBalance(userB, 900.1);
    });

    // Operation at Time 1
    it("should deposit 100 ETH from User A", async () => {
      // deposit 100 ETH
      const tx = await ethPool.connect(userA).deposit({ value: ethers.utils.parseEther("100.0") });

      // emit `Deposit` event
      expect(tx).to.emit(ethPool, "Deposit");

      // deposit balance is now 100 ETH
      const totalBalance = ethers.utils.formatEther(await ethPool.connect(team).totalDepositBalance());
      expect(totalBalance).to.equal("100.0");
    });

    // Operation at Time 2
    it("should deposit 300 ETH from User B", async () => {
      // User B deposits 300 ETH
      const tx = await ethPool.connect(userB).deposit({ value: ethers.utils.parseEther("300.0") });

      // emit `Deposit` event
      expect(tx).to.emit(ethPool, "Deposit");

      // deposit balance is now 400 ETH
      const totalBalance = ethers.utils.formatEther(await ethPool.connect(team).totalDepositBalance());
      expect(totalBalance).to.equal("400.0");
    });

    // Operation at Time 3
    it("should deposit 200 ETH of Reward from Team", async () => {
      // Team deposits reward of 200 ETH
      const tx = await ethPool.connect(team).depositReward({ value: ethers.utils.parseEther("200.0") });
      const rewardBalance = await ethPool.connect(userA).rewardPoolBalance();

      // emit `RewardAdded` event
      expect(tx).to.emit(ethPool, "RewardAdded");

      // deposit balance is now 400 ETH
      const totalBalance = ethers.utils.formatEther(await ethPool.connect(team).totalDepositBalance());
      expect(totalBalance).to.equal("400.0");

      // reward balance is now 200 ETH
      expect(ethers.utils.formatEther(rewardBalance)).to.equal("200.0");
    });

    // Operation at Time 4
    it("should deposit 100 ETH from User A", async () => {
      // deposit 100 ETH
      const tx = await ethPool.connect(userA).deposit({ value: ethers.utils.parseEther("100.0") });

      // emit `Deposit` event
      expect(tx).to.emit(ethPool, "Deposit");

      // deposit balance is now 500 ETH
      const totalBalance = ethers.utils.formatEther(await ethPool.connect(team).totalDepositBalance());
      expect(totalBalance).to.equal("500.0");
    });

    // Operation at Time 5
    it("should deposit 300 ETH from User B", async () => {
      // deposit 300 ETH
      const tx = await ethPool.connect(userB).deposit({ value: ethers.utils.parseEther("300.0") });

      // emit `Deposit` event
      expect(tx).to.emit(ethPool, "Deposit");

      // deposit balance is now 500 ETH
      const totalBalance = ethers.utils.formatEther(await ethPool.connect(team).totalDepositBalance());
      expect(totalBalance).to.equal("800.0");
    });

    // Operation at Time 6
    it("should deposit 200 ETH from User A", async () => {
      // deposit 200 ETH
      const tx = await ethPool.connect(userA).deposit({ value: ethers.utils.parseEther("200.0") });

      // emit `Deposit` event
      expect(tx).to.emit(ethPool, "Deposit");

      // deposit balance is now 1000 ETH
      const totalBalance = ethers.utils.formatEther(await ethPool.connect(team).totalDepositBalance());
      expect(totalBalance).to.equal("1000.0");
    });

    // Operation at Time 7
    it("should deposit 300 ETH from User B", async () => {
      // deposit 300 ETH
      const tx = await ethPool.connect(userB).deposit({ value: ethers.utils.parseEther("300.0") });

      // emit `Deposit` event
      expect(tx).to.emit(ethPool, "Deposit");

      // deposit balance is now 1300 ETH
      const totalBalance = ethers.utils.formatEther(await ethPool.connect(team).totalDepositBalance());
      expect(totalBalance).to.equal("1300.0");
    });

    // Operation at Time 8
    it("should deposit 200 ETH of Reward from Team", async () => {
      // Team deposits reward of 200 ETH
      const tx = await ethPool.connect(team).depositReward({ value: ethers.utils.parseEther("200.0") });
      const rewardBalance = await ethPool.connect(team).rewardPoolBalance();

      // emit `RewardAdded` event
      expect(tx).to.emit(ethPool, "RewardAdded");

      // deposit balance is now 1300 ETH
      const totalBalance = ethers.utils.formatEther(await ethPool.connect(team).totalDepositBalance());
      expect(totalBalance).to.equal("1300.0");

      // reward balance is now 200 ETH
      expect(ethers.utils.formatEther(rewardBalance)).to.equal("200.0");
    });

    // Operation at Time 9
    it("should deposit 300 ETH of Reward from Team", async () => {
      // Team deposits reward of 300 ETH
      const tx = await ethPool.connect(team).depositReward({ value: ethers.utils.parseEther("300.0") });
      const rewardBalance = await ethPool.connect(team).rewardPoolBalance();

      // emit `RewardAdded` event
      expect(tx).to.emit(ethPool, "RewardAdded");

      // deposit balance is now 1300 ETH
      const totalBalance = ethers.utils.formatEther(await ethPool.connect(team).totalDepositBalance());
      expect(totalBalance).to.equal("1300.0");

      // reward balance is now 500 ETH
      expect(ethers.utils.formatEther(rewardBalance)).to.equal("500.0");
    });

    // Operation at Time 10
    it("should withdraw 603.84... ETH to user A", async function () {
      // user A withdraws
      const tx = await ethPool.connect(userA).withdraw();

      const userA_Balance = await ethers.provider.getBalance(userA.address);
      const totalBalance = await ethPool.connect(team).totalDepositBalance();

      // emit `Withdrawal` event
      expect(tx).to.emit(ethPool, "Withdrawal");

      // deposit balance is now 900 ETH
      expect(ethers.utils.formatEther(totalBalance)).to.equal("900.0");

      // userA balance is now 603.84.. ETH
      expect(Number(ethers.utils.formatEther(userA_Balance))).to.closeTo(603.84, 0.2); // it is slightly greater because of added extra fee amount
    });

    // Operation at Time 11
    it("should withdraw 1396.25... ETH to user B", async function () {
      // user B withdraws
      const tx = await ethPool.connect(userB).withdraw();

      const userA_Balance = await ethers.provider.getBalance(userB.address);
      const totalBalance = await ethPool.connect(team).totalDepositBalance();

      // emit `Withdrawal` event
      expect(tx).to.emit(ethPool, "Withdrawal");

      // deposit balance is now 0 ETH
      expect(ethers.utils.formatEther(totalBalance)).to.equal("0.0");

      // userB balance is now 1396.15.. ETH
      expect(Number(ethers.utils.formatEther(userA_Balance))).to.closeTo(1396.15, 0.2);
    });
  });
});

// transfer all balance from (from) address to (to) address
async function sweep(from: SignerWithAddress, to: SignerWithAddress) {
  const provider = ethers.getDefaultProvider();
  // get the current balance
  const balance = await from.getBalance();

  // need to compute EXACTLY how much value to send
  // not sure why `await provider.getGasPrice()` is not working. So supply the value manually
  // and set `gasPrice` property from hardhat.config
  const gasPrice = BN.from(875000000);

  // the exact cost (in gas) to send to an Externally Owned Account (EOA)
  const gasLimit = 21000;

  // the balance less exactly the txfee in wei
  let value = balance.sub(gasPrice.mul(gasLimit));
  // send all balance (from) account to (to)
  let tx = await from.sendTransaction({
    gasLimit: gasLimit,
    gasPrice: gasPrice,
    to: to.address,
    value: value,
  });

  // console.log('Sent in Transaction: ' + tx.hash);
}

// set balance of the (account) to the specifed (amount)
async function setBalance(account: SignerWithAddress, balance: number): Promise<void> {
  // transfer all the `account` balance to the `treasury`
  await sweep(account, treasury);

  // Create a transaction object
  let tx = {
    to: account.address,
    // Convert currency unit from ether to wei
    value: ethers.utils.parseEther(balance.toString()),
  };

  // Send a transaction from treasury account
  await treasury.sendTransaction(tx).then(txObj => {
    // console.log('txHash', txObj.hash)
  });

  // console.log("account balance after : ", await account.getBalance())
}
