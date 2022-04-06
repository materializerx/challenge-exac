## Exactly Challenge

This challenge implements ETHPool which provides a service where people can deposit ETH and they will receive weekly rewards. Users must be able to take out their deposits along with their portion of rewards at any time. New rewards are deposited manually into the pool by the ETHPool team each week using a contract function.

### Requirements and considerations

- Only the `Team` can deposit rewards.
  - To keep it simple, let's consider that `Team` is the owner of the contract, which means `Team` address is the deployer of the `ETH Pool` Contract.
- Deposited rewards go to the pool of users, not to individual users.
  - `Team` can deposit rewards at anytime.
- Users should be able to withdraw their deposits along with their share of rewards considering the time when they deposited.

### How rewards are calculated

Since there is no requirement to use `timestamp` in this project, we can implement something simpler to calculate rewards. This is done by keeping **last reward Index** which is updated everytime a new reward is deposited.  
Everytime a new reward is deposited, 1) a snapshot of a total deposit balance with 2) newly deposited reward amount is taken.
So when a new deposit is made to the `ETH Pool`, first, the contract calculates the rewards corresponding to the previous deposits to the user who made the deposit.
This is done by keeping an index `rewardIndex` which keeps track of the current reward index for that particular user.

### Deployment to Ropsten and contract interaction

I have created a Hardhat task to do:

- Deploy the contract to Ropsten network
- User A deposits 0.1 ETH to ETH Pool
- User B deposits 0.2 ETH to ETH Pool
- Query the total amount of ETH held in the contract.

Following code block shows the outputs of the execution of the script

```
❯ npx hardhat deploy:ETHPool --network ropsten
Eth Pool deployed to:  0xA947D1436f5E6B1205564525f643bEC13651B23F
Eth Pool balance after user A deposits 0.1 ETH :  0.1
Eth Pool balance after user B deposits 0.2 ETH :  0.3
Eth Pool balance :  0.3
```

**Bonus** : `ETH Pool` contract has been deployed to Ropsten network.
It can be check from the etherscan link <https://ropsten.etherscan.io/address/0x6c25f6250140c4dd6ab39f66d83aea265b3a4401>

## Up & Running

This project uses solidity template from <https://github.com/paulrberg/solidity-template>

### Pre Requisites

Before running any command, you need to create a `.env` file and set a BIP-39 compatible mnemonic as an environment
variable. Follow the example in `.env.example`. If you don't already have a mnemonic, use this [website](https://iancoleman.io/bip39/) to generate one.

Then, proceed with installing dependencies:

```sh
yarn install
```

### Compile

Compile the smart contracts with Hardhat:

```sh
$ yarn compile
```

### TypeChain

Compile the smart contracts and generate TypeChain artifacts:

```sh
$ yarn typechain
```

### Test

Run the Mocha tests:

```sh
$ yarn test
```

### Coverage

Generate the code coverage report:

```sh
$ yarn coverage
```
