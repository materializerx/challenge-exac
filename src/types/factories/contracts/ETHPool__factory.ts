/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ETHPool, ETHPoolInterface } from "../../contracts/ETHPool";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Deposit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "RewardAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdrawal",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "addr",
        type: "address",
      },
    ],
    name: "computeClaimableReward",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "depositReward",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "lastRewardSnapshotIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "rewardPoolBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "rewardSnapshots",
    outputs: [
      {
        internalType: "uint256",
        name: "totalDepositBalance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "reward",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalDepositBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "userAccounts",
    outputs: [
      {
        internalType: "uint256",
        name: "depositAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "claimableReward",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "rewardIndex",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5061001a3361001f565b61006f565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b610b078061007e6000396000f3fe6080604052600436106100c75760003560e01c80637a5c08ae11610074578063d0e30db01161004e578063d0e30db014610213578063e8c0a0df1461021b578063f2fde38b1461023157600080fd5b80637a5c08ae146101b55780638da5cb5b146101cb57806396aafb11146101f357600080fd5b80635ec2dc8d116100a55780635ec2dc8d146101745780636b9bccec1461017c578063715018a6146101a057600080fd5b80633ccfd60b146100cc5780635251d91c146100e35780635d6485881461013f575b600080fd5b3480156100d857600080fd5b506100e1610251565b005b3480156100ef57600080fd5b5061011f6100fe3660046109fc565b60056020526000908152604090208054600182015460029092015490919083565b604080519384526020840192909252908201526060015b60405180910390f35b34801561014b57600080fd5b5061015f61015a366004610a2c565b61037e565b60408051928352602083019190915201610136565b6100e16103ac565b34801561018857600080fd5b5061019260035481565b604051908152602001610136565b3480156101ac57600080fd5b506100e1610536565b3480156101c157600080fd5b5061019260025481565b3480156101d757600080fd5b506000546040516001600160a01b039091168152602001610136565b3480156101ff57600080fd5b5061019261020e3660046109fc565b61059c565b6100e1610685565b34801561022757600080fd5b5061019260015481565b34801561023d57600080fd5b506100e161024c3660046109fc565b610794565b33600090815260056020526040902054806102b35760405162461bcd60e51b815260206004820152601d60248201527f4572726f723a206465706f73697420616d6f756e74206973207a65726f00000060448201526064015b60405180910390fd5b60006102be3361059c565b336000908152600560205260409020600101546102db9190610a5b565b3360009081526005602052604081208181556001808201839055600290910182905580549293508492909190610312908490610a73565b909155507f7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b659050336103448385610a5b565b604080516001600160a01b03909316835260208301919091520160405180910390a161037a6103738284610a5b565b3390610876565b5050565b6004818154811061038e57600080fd5b60009182526020909120600290910201805460019091015490915082565b6000546001600160a01b031633146104065760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016102aa565b600034116104565760405162461bcd60e51b815260206004820152601d60248201527f4572726f723a206465706f73697420616d6f756e74206973205a45524f00000060448201526064016102aa565b6040805180820190915260018054825234602083018181526004805493840181556000908152935160029384027f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b81019190915590517f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19c9091015581549092906104e1908490610a5b565b9091555050600380549060006104f683610a8a565b9091555050604080513381523460208201527fac24935fd910bc682b5ccb1a07b718cadf8cf2f6d1404c4f3ddc3662dae40e2991015b60405180910390a1565b6000546001600160a01b031633146105905760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016102aa565b61059a6000610994565b565b6001600160a01b038116600090815260056020526040812060028101549054600354839291908083036105d55750600095945050505050565b825b8181101561065c57600481815481106105f2576105f2610aa3565b9060005260206000209060020201600001546004828154811061061757610617610aa3565b906000526020600020906002020160010154846106349190610ab9565b61063e9190610ad8565b6106489086610a5b565b94508061065481610a8a565b9150506105d7565b50831561067b5783600260008282546106759190610a73565b90915550505b5091949350505050565b600034116106d55760405162461bcd60e51b815260206004820152601d60248201527f4572726f723a206465706f73697420616d6f756e74206973205a45524f00000060448201526064016102aa565b6106de3361059c565b3360009081526005602052604081206001018054909190610700908490610a5b565b90915550503360009081526005602052604081208054349290610724908490610a5b565b92505081905550346001600082825461073d9190610a5b565b90915550506003543360008181526005602090815260409182902060020193909355805191825234928201929092527fe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c910161052c565b6000546001600160a01b031633146107ee5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016102aa565b6001600160a01b03811661086a5760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201527f646472657373000000000000000000000000000000000000000000000000000060648201526084016102aa565b61087381610994565b50565b804710156108c65760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a20696e73756666696369656e742062616c616e636500000060448201526064016102aa565b6000826001600160a01b03168260405160006040518083038185875af1925050503d8060008114610913576040519150601f19603f3d011682016040523d82523d6000602084013e610918565b606091505b505090508061098f5760405162461bcd60e51b815260206004820152603a60248201527f416464726573733a20756e61626c6520746f2073656e642076616c75652c207260448201527f6563697069656e74206d6179206861766520726576657274656400000000000060648201526084016102aa565b505050565b600080546001600160a01b038381167fffffffffffffffffffffffff0000000000000000000000000000000000000000831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b600060208284031215610a0e57600080fd5b81356001600160a01b0381168114610a2557600080fd5b9392505050565b600060208284031215610a3e57600080fd5b5035919050565b634e487b7160e01b600052601160045260246000fd5b60008219821115610a6e57610a6e610a45565b500190565b600082821015610a8557610a85610a45565b500390565b600060018201610a9c57610a9c610a45565b5060010190565b634e487b7160e01b600052603260045260246000fd5b6000816000190483118215151615610ad357610ad3610a45565b500290565b600082610af557634e487b7160e01b600052601260045260246000fd5b50049056fea164736f6c634300080d000a";

type ETHPoolConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ETHPoolConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ETHPool__factory extends ContractFactory {
  constructor(...args: ETHPoolConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ETHPool> {
    return super.deploy(overrides || {}) as Promise<ETHPool>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): ETHPool {
    return super.attach(address) as ETHPool;
  }
  override connect(signer: Signer): ETHPool__factory {
    return super.connect(signer) as ETHPool__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ETHPoolInterface {
    return new utils.Interface(_abi) as ETHPoolInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ETHPool {
    return new Contract(address, _abi, signerOrProvider) as ETHPool;
  }
}
