import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
// import { Signers } from "./types";
import { expect } from "chai";
import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";

import type { ETHPool } from "../src/types/contracts/ETHPool";

// import { ETHPool__factory } from "../src/types";

const BN = ethers.BigNumber;
const Decimals = BN.from(18);
const ETH = BN.from(10).pow(Decimals);

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

  describe(`Testing new logic 
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
    it("should allow to deposit 100 ETH from User A", async () => {
      // await ethPool.connect(userA).deposit({value: ETH.mul(100)})
      await ethPool.connect(userA).deposit({ value: ethers.utils.parseEther("100.0") });
      let contractETHBalance = await ethers.provider.getBalance(ethPool.address);
      let totalBalance = await ethPool.connect(userA).totalDepositBalance();
      // current contract balance 100 ETH
      expect(ethers.utils.formatEther(contractETHBalance)).to.equal("100.0");

      // total balance is now 100 ETH
      expect(ethers.utils.formatEther(totalBalance)).to.equal("100.0");
    });

    // Operation at Time 2
    it("should allow to deposit 300 ETH from User B", async () => {
      await ethPool.connect(userB).deposit({ value: ETH.mul(300) });
      let contractETHBalance = await ethers.provider.getBalance(ethPool.address);
      // current contract balance 400 ETH
      expect(ethers.utils.formatEther(contractETHBalance)).to.equal("400.0");
    });

    // Operation at Time 3
    it("should deposit 200 ETH of Reward from Team", async () => {
      await ethPool.connect(team).depositReward({ value: ETH.mul(200) });
      let contractETHBalance = await ethers.provider.getBalance(ethPool.address);
      // current contract balance 600 ETH
      expect(ethers.utils.formatEther(contractETHBalance)).to.equal("600.0");
    });

    // Operation at Time 4
    it("should withdraw 150 ETH to user A", async function () {
      await ethPool.connect(userA).withdraw();
      let userA_Balance = await ethers.provider.getBalance(userA.address);
      let contractBalance = await ethers.provider.getBalance(ethPool.address);
      let totalBalance = await ethPool.connect(userA).totalDepositBalance();
      let rewardBalance = await ethPool.connect(userA).rewardPoolBalance();

      // contract balance is now 450 ETH
      expect(ethers.utils.formatEther(contractBalance)).to.equal("450.0");

      // total balance is now 300 ETH
      expect(ethers.utils.formatEther(totalBalance)).to.equal("300.0");

      // reward balance is now 150 ETH
      expect(ethers.utils.formatEther(rewardBalance)).to.equal("150.0");

      // userA balance is now 150 ETH
      expect(Number(ethers.utils.formatEther(userA_Balance))).to.closeTo(150, 0.1);
    });

    // Operation at Time 5
    it("should withdraw 450 ETH to user B", async function () {
      await ethPool.connect(userB).withdraw();
      let userB_Balance = await ethers.provider.getBalance(userB.address);
      let poolBalance = await ethers.provider.getBalance(ethPool.address);
      let totalBalance = await ethPool.connect(userA).totalDepositBalance();
      let rewardBalance = await ethPool.connect(userA).rewardPoolBalance();

      // pool balance is now 0 ETH
      expect(ethers.utils.formatEther(poolBalance)).to.equal("0.0");

      // total balance is now 0 ETH
      expect(ethers.utils.formatEther(totalBalance)).to.equal("0.0");

      // reward balance is now 0 ETH
      expect(ethers.utils.formatEther(rewardBalance)).to.equal("0.0");

      // userB balance is now 450 ETH
      expect(Number(ethers.utils.formatEther(userB_Balance))).to.closeTo(450, 0.1);
    });
  });

  describe(`Testing new logic 2
  When A deposits then T deposits then B deposits then A withdraws and finally B withdraws. 
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
    it("should allow to deposit 100 ETH from User A", async () => {
      await ethPool.connect(userA).deposit({ value: ETH.mul(100) });
      let contractETHBalance = await ethers.provider.getBalance(ethPool.address);
      let totalBalance = await ethPool.connect(userA).totalDepositBalance();
      // current contract balance 100 ETH
      expect(ethers.utils.formatEther(contractETHBalance)).to.equal("100.0");

      // total balance is now 100 ETH
      expect(ethers.utils.formatEther(totalBalance)).to.equal("100.0");
    });

    // Operation at Time 2
    it("should allow to deposit 200 ETH of Reward from Team", async () => {
      await ethPool.connect(team).depositReward({ value: ETH.mul(200) });
      let contractETHBalance = await ethers.provider.getBalance(ethPool.address);
      // current contract balance 300 ETH
      expect(ethers.utils.formatEther(contractETHBalance)).to.equal("300.0");
    });

    // Operation at Time 3
    it("should allow to deposit 300 ETH from User B", async () => {
      await ethPool.connect(userB).deposit({ value: ETH.mul(300) });
      let contractETHBalance = await ethers.provider.getBalance(ethPool.address);
      let totalBalance = await ethPool.connect(userA).totalDepositBalance();

      // current contract balance 600 ETH
      expect(ethers.utils.formatEther(contractETHBalance)).to.equal("600.0");

      // total balance is now 400 ETH
      expect(ethers.utils.formatEther(totalBalance)).to.equal("400.0");
    });

    // Operation at Time 4
    it("should withdraw 300 ETH to user A", async function () {
      await ethPool.connect(userA).withdraw();
      let userA_Balance = await ethers.provider.getBalance(userA.address);
      let contractBalance = await ethers.provider.getBalance(ethPool.address);
      let totalBalance = await ethPool.connect(userA).totalDepositBalance();
      let rewardBalance = await ethPool.connect(userA).rewardPoolBalance();

      // contract balance is now 300 ETH
      expect(ethers.utils.formatEther(contractBalance)).to.equal("300.0");

      // total balance is now 300 ETH
      expect(ethers.utils.formatEther(totalBalance)).to.equal("300.0");

      // reward balance is now 0 ETH
      expect(ethers.utils.formatEther(rewardBalance)).to.equal("0.0");

      // userA balance is now 300 ETH
      expect(Number(ethers.utils.formatEther(userA_Balance))).to.closeTo(300, 0.1);
    });

    // Operation at Time 5
    it("should withdraw 300 ETH to user B", async function () {
      await ethPool.connect(userB).withdraw();
      let userB_Balance = await ethers.provider.getBalance(userB.address);
      let contractBalance = await ethers.provider.getBalance(ethPool.address);
      let totalBalance = await ethPool.connect(userA).totalDepositBalance();
      let rewardBalance = await ethPool.connect(userA).rewardPoolBalance();

      // contract balance is now 0 ETH
      expect(ethers.utils.formatEther(contractBalance)).to.equal("0.0");

      // total balance is now 0 ETH
      expect(ethers.utils.formatEther(totalBalance)).to.equal("0.0");

      // reward balance is now 0 ETH
      expect(ethers.utils.formatEther(rewardBalance)).to.equal("0.0");

      // userB balance is now 300 ETH
      expect(Number(ethers.utils.formatEther(userB_Balance))).to.closeTo(300, 0.1);
    });
  });

  describe(`Testing new logic 3
  When there are multiple interleaved deposits from User A and B and consecutive Reward deposits. 
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
  | 10   | Withdraw  | 603.83 |         |      | 0       | 496.15 | 0      | 900    | 900   |
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
    it("should allow to deposit 100 ETH from User A", async () => {
      await ethPool.connect(userA).deposit({ value: ETH.mul(100) });
      let contractETHBalance = await ethers.provider.getBalance(ethPool.address);
      // current contract balance 100 ETH
      await expect(ethers.utils.formatEther(contractETHBalance)).to.equal("100.0");
    });

    // Operation at Time 2
    it("should allow to deposit 300 ETH from User B", async () => {
      await ethPool.connect(userB).deposit({ value: ETH.mul(300) });
      let contractETHBalance = await ethers.provider.getBalance(ethPool.address);
      // current contract balance 400 ETH
      expect(ethers.utils.formatEther(contractETHBalance)).to.equal("400.0");
    });

    // Operation at Time 3
    it("should allow to deposit 200 ETH of Reward from Team", async () => {
      await ethPool.connect(team).depositReward({ value: ETH.mul(200) });
      let contractETHBalance = await ethers.provider.getBalance(ethPool.address);
      // current contract balance 600 ETH
      expect(ethers.utils.formatEther(contractETHBalance)).to.equal("600.0");
    });

    // Operation at Time 4
    it("should allow to deposit 100 ETH from User A", async () => {
      await ethPool.connect(userA).deposit({ value: ETH.mul(100) });
      let contractETHBalance = await ethers.provider.getBalance(ethPool.address);
      // current contract balance 700 ETH
      await expect(ethers.utils.formatEther(contractETHBalance)).to.equal("700.0");
    });

    // Operation at Time 5
    it("should allow to deposit 300 ETH from User B", async () => {
      await ethPool.connect(userB).deposit({ value: ETH.mul(300) });
      let contractETHBalance = await ethers.provider.getBalance(ethPool.address);
      // current contract balance 1000 ETH
      expect(ethers.utils.formatEther(contractETHBalance)).to.equal("1000.0");
    });

    // Operation at Time 6
    it("should allow to deposit 200 ETH from User A", async () => {
      await ethPool.connect(userA).deposit({ value: ETH.mul(200) });
      let contractETHBalance = await ethers.provider.getBalance(ethPool.address);
      // current contract balance 1200 ETH
      await expect(ethers.utils.formatEther(contractETHBalance)).to.equal("1200.0");
    });

    // Operation at Time 7
    it("should allow to deposit 300 ETH from User B", async () => {
      await ethPool.connect(userB).deposit({ value: ETH.mul(300) });
      let contractETHBalance = await ethers.provider.getBalance(ethPool.address);
      // current contract balance 1500 ETH
      expect(ethers.utils.formatEther(contractETHBalance)).to.equal("1500.0");
    });

    // Operation at Time 8
    it("should allow to deposit 200 ETH of Reward from Team", async () => {
      await ethPool.connect(team).depositReward({ value: ETH.mul(200) });
      let contractETHBalance = await ethers.provider.getBalance(ethPool.address);
      // current contract balance 1700 ETH
      expect(ethers.utils.formatEther(contractETHBalance)).to.equal("1700.0");
    });

    // Operation at Time 9
    it("should allow to deposit 300 ETH of Reward from Team", async () => {
      await ethPool.connect(team).depositReward({ value: ETH.mul(300) });
      let contractETHBalance = await ethers.provider.getBalance(ethPool.address);
      // current contract balance 2000 ETH
      expect(ethers.utils.formatEther(contractETHBalance)).to.equal("2000.0");
    });

    // Operation at Time 10
    it("should withdraw 603.84... ETH to user A", async function () {
      await ethPool.connect(userA).withdraw();
      let userA_Balance = await ethers.provider.getBalance(userA.address);
      let poolBalance = await ethers.provider.getBalance(ethPool.address);

      // userA balance is now 603.84... ETH
      expect(Number(ethers.utils.formatEther(userA_Balance))).to.closeTo(603.84, 0.2);
      // pool balance is now 1396.15... ETH
      expect(Number(ethers.utils.formatEther(poolBalance))).to.closeTo(1396.15, 0.01);
    });

    // Operation at Time 11
    it("should withdraw 1396.25... ETH to user B", async function () {
      await ethPool.connect(userB).withdraw();
      let userB_Balance = await ethers.provider.getBalance(userB.address);
      let poolBalance = await ethers.provider.getBalance(ethPool.address);

      // userB balance is now 1396.25... ETH
      expect(Number(ethers.utils.formatEther(userB_Balance))).to.closeTo(1396.25, 0.01);
      // pool balance is now 0 ETH
      expect(Number(ethers.utils.formatEther(poolBalance))).to.closeTo(0.0, 0.00000000000000001);
    });
  });
});

// transfer all balance from (from) address to (to) address
async function sweep(from: SignerWithAddress, to: SignerWithAddress) {
  const provider = ethers.getDefaultProvider();
  // get the current balance
  const balance = await from.getBalance();

  // need to compute EXACTLY how much value to send
  // not sure why getGasPrice() is not working. Instead enter the value manually
  // and set `gasPrice` property from hardhat.config
  // let gasPrice = await provider.getGasPrice();
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
