/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import { TypedEventFilter, TypedEvent, TypedListener } from "./commons";

interface ZAuctionV1Interface extends ethers.utils.Interface {
  functions: {
    "acceptBid(bytes,uint256,address,uint256,address,uint256,uint256,uint256,uint256)": FunctionFragment;
    "cancelBidsUnderPrice(uint256,uint256)": FunctionFragment;
    "consumed(address,uint256)": FunctionFragment;
    "createBid(uint256,uint256,address,uint256,uint256,uint256,uint256)": FunctionFragment;
    "recover(bytes32,bytes)": FunctionFragment;
    "registrar()": FunctionFragment;
    "toEthSignedMessageHash(bytes32)": FunctionFragment;
    "token()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "acceptBid",
    values: [
      BytesLike,
      BigNumberish,
      string,
      BigNumberish,
      string,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "cancelBidsUnderPrice",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "consumed",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "createBid",
    values: [
      BigNumberish,
      BigNumberish,
      string,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "recover",
    values: [BytesLike, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "registrar", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "toEthSignedMessageHash",
    values: [BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "token", values?: undefined): string;

  decodeFunctionResult(functionFragment: "acceptBid", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "cancelBidsUnderPrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "consumed", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "createBid", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "recover", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "registrar", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "toEthSignedMessageHash",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "token", data: BytesLike): Result;

  events: {
    "BidAccepted(uint256,address,address,uint256,address,uint256,uint256)": EventFragment;
    "Cancelled(address,uint256,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "BidAccepted"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Cancelled"): EventFragment;
}

export class ZAuctionV1 extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: ZAuctionV1Interface;

  functions: {
    acceptBid(
      signature: BytesLike,
      auctionid: BigNumberish,
      bidder: string,
      bid: BigNumberish,
      nftaddress: string,
      tokenid: BigNumberish,
      minbid: BigNumberish,
      startblock: BigNumberish,
      expireblock: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    cancelBidsUnderPrice(
      auctionid: BigNumberish,
      price: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    consumed(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    createBid(
      auctionid: BigNumberish,
      bid: BigNumberish,
      nftaddress: string,
      tokenid: BigNumberish,
      minbid: BigNumberish,
      startblock: BigNumberish,
      expireblock: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string] & { data: string }>;

    recover(
      hash: BytesLike,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string]>;

    registrar(overrides?: CallOverrides): Promise<[string]>;

    toEthSignedMessageHash(
      hash: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string]>;

    token(overrides?: CallOverrides): Promise<[string]>;
  };

  acceptBid(
    signature: BytesLike,
    auctionid: BigNumberish,
    bidder: string,
    bid: BigNumberish,
    nftaddress: string,
    tokenid: BigNumberish,
    minbid: BigNumberish,
    startblock: BigNumberish,
    expireblock: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  cancelBidsUnderPrice(
    auctionid: BigNumberish,
    price: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  consumed(
    arg0: string,
    arg1: BigNumberish,
    overrides?: CallOverrides
  ): Promise<boolean>;

  createBid(
    auctionid: BigNumberish,
    bid: BigNumberish,
    nftaddress: string,
    tokenid: BigNumberish,
    minbid: BigNumberish,
    startblock: BigNumberish,
    expireblock: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  recover(
    hash: BytesLike,
    signature: BytesLike,
    overrides?: CallOverrides
  ): Promise<string>;

  registrar(overrides?: CallOverrides): Promise<string>;

  toEthSignedMessageHash(
    hash: BytesLike,
    overrides?: CallOverrides
  ): Promise<string>;

  token(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    acceptBid(
      signature: BytesLike,
      auctionid: BigNumberish,
      bidder: string,
      bid: BigNumberish,
      nftaddress: string,
      tokenid: BigNumberish,
      minbid: BigNumberish,
      startblock: BigNumberish,
      expireblock: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    cancelBidsUnderPrice(
      auctionid: BigNumberish,
      price: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    consumed(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    createBid(
      auctionid: BigNumberish,
      bid: BigNumberish,
      nftaddress: string,
      tokenid: BigNumberish,
      minbid: BigNumberish,
      startblock: BigNumberish,
      expireblock: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    recover(
      hash: BytesLike,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    registrar(overrides?: CallOverrides): Promise<string>;

    toEthSignedMessageHash(
      hash: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    token(overrides?: CallOverrides): Promise<string>;
  };

  filters: {
    BidAccepted(
      auctionid?: null,
      bidder?: string | null,
      seller?: string | null,
      amount?: null,
      nftaddress?: null,
      tokenid?: null,
      expireblock?: null
    ): TypedEventFilter<
      [BigNumber, string, string, BigNumber, string, BigNumber, BigNumber],
      {
        auctionid: BigNumber;
        bidder: string;
        seller: string;
        amount: BigNumber;
        nftaddress: string;
        tokenid: BigNumber;
        expireblock: BigNumber;
      }
    >;

    Cancelled(
      bidder?: string | null,
      auctionid?: BigNumberish | null,
      price?: null
    ): TypedEventFilter<
      [string, BigNumber, BigNumber],
      { bidder: string; auctionid: BigNumber; price: BigNumber }
    >;
  };

  estimateGas: {
    acceptBid(
      signature: BytesLike,
      auctionid: BigNumberish,
      bidder: string,
      bid: BigNumberish,
      nftaddress: string,
      tokenid: BigNumberish,
      minbid: BigNumberish,
      startblock: BigNumberish,
      expireblock: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    cancelBidsUnderPrice(
      auctionid: BigNumberish,
      price: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    consumed(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    createBid(
      auctionid: BigNumberish,
      bid: BigNumberish,
      nftaddress: string,
      tokenid: BigNumberish,
      minbid: BigNumberish,
      startblock: BigNumberish,
      expireblock: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    recover(
      hash: BytesLike,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    registrar(overrides?: CallOverrides): Promise<BigNumber>;

    toEthSignedMessageHash(
      hash: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    token(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    acceptBid(
      signature: BytesLike,
      auctionid: BigNumberish,
      bidder: string,
      bid: BigNumberish,
      nftaddress: string,
      tokenid: BigNumberish,
      minbid: BigNumberish,
      startblock: BigNumberish,
      expireblock: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    cancelBidsUnderPrice(
      auctionid: BigNumberish,
      price: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    consumed(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    createBid(
      auctionid: BigNumberish,
      bid: BigNumberish,
      nftaddress: string,
      tokenid: BigNumberish,
      minbid: BigNumberish,
      startblock: BigNumberish,
      expireblock: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    recover(
      hash: BytesLike,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    registrar(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    toEthSignedMessageHash(
      hash: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    token(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
