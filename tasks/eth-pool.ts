import { Signer } from "@ethersproject/abstract-signer";
import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { ETHPool } from "../src/types/contracts/ETHPool";
import { ETHPool__factory } from "../src/types/factories/contracts/ETHPool__factory";

task("deploy:ETHPool", "ETH Pool deployment").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const ethPoolFactory: ETHPool__factory = <ETHPool__factory>await ethers.getContractFactory("ETHPool");
  const ethPool: ETHPool = <ETHPool>await ethPoolFactory.deploy();
  await ethPool.deployed();
  console.log("Eth Pool deployed to: ", ethPool.address);

  const accounts: Signer[] = await ethers.getSigners();
  const team = accounts[0];
  const userA = accounts[1];
  const userB = accounts[2];

  let amount, totalDepositBalance;

  // initialize account balance for userA to 0.1 ETH with small amount for the transaction fee.
  await transfer(team, userA, 0.11);

  // initialize account balance for userB to 0.2 ETH with small amount for the transaction fee.
  await transfer(team, userB, 0.21);

  // user A deposits 0.1 ETH to ETH Pool
  amount = { value: ethers.utils.parseEther("0.1") };
  await ethPool.connect(userA).deposit(amount);
  totalDepositBalance = await ethPool.connect(team).totalDepositBalance();

  // print out the ETH Pool balance
  console.log("Eth Pool balance after user A deposits 0.1 ETH : ", ethers.utils.formatEther(totalDepositBalance));

  // user B deposits 0.2 ETH to ETH Pool
  amount = { value: ethers.utils.parseEther("0.2") };
  await ethPool.connect(userB).deposit(amount);
  totalDepositBalance = await ethPool.connect(team).totalDepositBalance();

  // print out the ETH Pool balance
  console.log("Eth Pool balance after user B deposits 0.2 ETH : ", ethers.utils.formatEther(totalDepositBalance));

  // total amount of ETH held in the contract.
  totalDepositBalance = await ethPool.connect(team).totalDepositBalance();
  console.log("Eth Pool balance : ", ethers.utils.formatEther(totalDepositBalance));

  // helper function to transfer the amount
  async function transfer(from: Signer, to: Signer, amount: number) {
    // Create a transaction object
    let tx = {
      to: to.getAddress(),
      // Convert currency unit from ether to wei
      value: ethers.utils.parseEther(amount.toString()),
    };
    // Send a transaction from `from`
    await from.sendTransaction(tx).then(txObj => {
      console.log("txHash", txObj.hash);
    });
  }
});
