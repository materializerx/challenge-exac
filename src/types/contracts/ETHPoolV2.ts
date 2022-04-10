/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "../common";

export interface ETHPoolV2Interface extends utils.Interface {
  functions: {
    "_depositPool()": FunctionFragment;
    "_notYetRewardableAmount()": FunctionFragment;
    "_rewardableAmount()": FunctionFragment;
    "_rewardsPool()": FunctionFragment;
    "accounts(address)": FunctionFragment;
    "deposit()": FunctionFragment;
    "depositReward()": FunctionFragment;
    "lastRewardDepositTime()": FunctionFragment;
    "owner()": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "rewardPoolBalance()": FunctionFragment;
    "totalDepositBalance()": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "withdraw()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "_depositPool"
      | "_notYetRewardableAmount"
      | "_rewardableAmount"
      | "_rewardsPool"
      | "accounts"
      | "deposit"
      | "depositReward"
      | "lastRewardDepositTime"
      | "owner"
      | "renounceOwnership"
      | "rewardPoolBalance"
      | "totalDepositBalance"
      | "transferOwnership"
      | "withdraw"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "_depositPool",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "_notYetRewardableAmount",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "_rewardableAmount",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "_rewardsPool",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "accounts", values: [string]): string;
  encodeFunctionData(functionFragment: "deposit", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "depositReward",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "lastRewardDepositTime",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "rewardPoolBalance",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "totalDepositBalance",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "withdraw", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "_depositPool",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_notYetRewardableAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_rewardableAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_rewardsPool",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "accounts", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "depositReward",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "lastRewardDepositTime",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "rewardPoolBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "totalDepositBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;

  events: {
    "OwnershipTransferred(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
}

export interface OwnershipTransferredEventObject {
  previousOwner: string;
  newOwner: string;
}
export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  OwnershipTransferredEventObject
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export interface ETHPoolV2 extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ETHPoolV2Interface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    _depositPool(overrides?: CallOverrides): Promise<[BigNumber]>;

    _notYetRewardableAmount(overrides?: CallOverrides): Promise<[BigNumber]>;

    _rewardableAmount(overrides?: CallOverrides): Promise<[BigNumber]>;

    _rewardsPool(overrides?: CallOverrides): Promise<[BigNumber]>;

    accounts(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber] & {
        claimableDepositAmount: BigNumber;
        rewardCalculableAmount: BigNumber;
        claimableRewards: BigNumber;
        lastDepositTime: BigNumber;
      }
    >;

    deposit(
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    depositReward(
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    lastRewardDepositTime(overrides?: CallOverrides): Promise<[BigNumber]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    rewardPoolBalance(overrides?: CallOverrides): Promise<[BigNumber]>;

    totalDepositBalance(overrides?: CallOverrides): Promise<[BigNumber]>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    withdraw(
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  _depositPool(overrides?: CallOverrides): Promise<BigNumber>;

  _notYetRewardableAmount(overrides?: CallOverrides): Promise<BigNumber>;

  _rewardableAmount(overrides?: CallOverrides): Promise<BigNumber>;

  _rewardsPool(overrides?: CallOverrides): Promise<BigNumber>;

  accounts(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber, BigNumber, BigNumber] & {
      claimableDepositAmount: BigNumber;
      rewardCalculableAmount: BigNumber;
      claimableRewards: BigNumber;
      lastDepositTime: BigNumber;
    }
  >;

  deposit(
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  depositReward(
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  lastRewardDepositTime(overrides?: CallOverrides): Promise<BigNumber>;

  owner(overrides?: CallOverrides): Promise<string>;

  renounceOwnership(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  rewardPoolBalance(overrides?: CallOverrides): Promise<BigNumber>;

  totalDepositBalance(overrides?: CallOverrides): Promise<BigNumber>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  withdraw(
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    _depositPool(overrides?: CallOverrides): Promise<BigNumber>;

    _notYetRewardableAmount(overrides?: CallOverrides): Promise<BigNumber>;

    _rewardableAmount(overrides?: CallOverrides): Promise<BigNumber>;

    _rewardsPool(overrides?: CallOverrides): Promise<BigNumber>;

    accounts(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber] & {
        claimableDepositAmount: BigNumber;
        rewardCalculableAmount: BigNumber;
        claimableRewards: BigNumber;
        lastDepositTime: BigNumber;
      }
    >;

    deposit(overrides?: CallOverrides): Promise<void>;

    depositReward(overrides?: CallOverrides): Promise<void>;

    lastRewardDepositTime(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<string>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    rewardPoolBalance(overrides?: CallOverrides): Promise<BigNumber>;

    totalDepositBalance(overrides?: CallOverrides): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    withdraw(overrides?: CallOverrides): Promise<void>;
  };

  filters: {
    "OwnershipTransferred(address,address)"(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;
  };

  estimateGas: {
    _depositPool(overrides?: CallOverrides): Promise<BigNumber>;

    _notYetRewardableAmount(overrides?: CallOverrides): Promise<BigNumber>;

    _rewardableAmount(overrides?: CallOverrides): Promise<BigNumber>;

    _rewardsPool(overrides?: CallOverrides): Promise<BigNumber>;

    accounts(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    deposit(
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    depositReward(
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    lastRewardDepositTime(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    rewardPoolBalance(overrides?: CallOverrides): Promise<BigNumber>;

    totalDepositBalance(overrides?: CallOverrides): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    withdraw(
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    _depositPool(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    _notYetRewardableAmount(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    _rewardableAmount(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    _rewardsPool(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    accounts(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    deposit(
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    depositReward(
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    lastRewardDepositTime(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    rewardPoolBalance(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    totalDepositBalance(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    withdraw(
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
