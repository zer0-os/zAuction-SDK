import { ethers } from "ethers";
import { Bid } from "./api/types";
export { Bid };

export interface Config {
  apiUri: string;
  subgraphUri: string;
  zAuctionAddress: string;
  tokenContract: string;
  web3Provider: ethers.providers.Web3Provider;
}

export interface zNSHub {
  addRegistrar: (rootDomainId: string, registrar: string) => Promise<void>;
  isController: (controllerAddress: string) => Promise<boolean>;
  getRegistrarForDomain:(domainId: string) => Promise<string>;
  ownerOf: (domainId: string) => Promise<string>;
  domainExists: (domainId: string) => Promise<boolean>;
  owner: () => Promise<string>;
  registrarBeacon:() => Promise<string>;
  parentOf: (domainId: string) => Promise<string>;
}

export interface Instance {
  listSales: (tokenId: string) => Promise<TokenSale[]>;
  listAllSales: () => Promise<TokenSaleCollection>;
  listBids: (tokenIds: string[]) => Promise<TokenBidCollection>;
  listBidsByAccount: (account: string) => Promise<Bid[]>;
  placeBid: (
    params: NewBidParameters,
    signer: ethers.Signer,
    statusCallback?: PlaceBidStatusCallback
  ) => Promise<void>;
  isZAuctionApprovedToTransferNft: (account: string) => Promise<boolean>;
  getZAuctionSpendAllowance: (account: string) => Promise<ethers.BigNumber>;
  getTradeTokenAddress: () => Promise<string>;
  approveZAuctionSpendTradeTokens: (
    signer: ethers.Signer
  ) => Promise<ethers.ContractTransaction>;
  approveZAuctionTransferNft: (
    signer: ethers.Signer
  ) => Promise<ethers.ContractTransaction>;
  acceptBid: (
    bid: Bid,
    signer: ethers.Signer
  ) => Promise<ethers.ContractTransaction>;
  cancelBid: (
    auctionId: string,
    signedBidMessage: string,
    cancelOnChain: boolean,
    signer: ethers.Signer
  ) => Promise<ethers.ContractTransaction | void>
  buyNow: (
    params: BuyNowParams,
    signer: ethers.Signer
  ) => Promise<ethers.ContractTransaction>;
  getBuyNowPrice: (
    tokenId: string,
    signer: ethers.Signer
  ) => Promise<Listing>;
  setBuyNowPrice: (
    params: BuyNowParams,
    signer: ethers.Signer
  ) => Promise<ethers.ContractTransaction>;
  cancelBuyNow: (
    tokenId: string,
    signer: ethers.Signer
  ) => Promise<ethers.ContractTransaction>;
}

export interface TokenSale {
  contract: string;
  tokenId: string;
  saleAmount: string;
  buyer: string;
  seller: string;
  timestamp: string;
}

export interface TokenSaleCollection {
  [tokenId: string]: TokenSale[];
}

export interface TokenBidCollection {
  [tokenId: string]: Bid[];
}

export type PlaceBidStatusCallback = (status: PlaceBidStatus) => void;

export enum PlaceBidStatus {
  Encoding,
  Signing,
  Submitting,
  Completed,
}

export interface NewBidParameters {
  tokenId: string;
  bidAmount: string; // in wei
  startBlock?: string;
  expireBlock?: string;
}

export interface BuyNowParams {
  amount: string;
  tokenId: string;
}

export interface Listing {
  price: ethers.BigNumber;
  holder: string;
}
