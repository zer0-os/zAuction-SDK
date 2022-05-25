import { ethers } from "ethers";
import { Bid } from "./api/types";
export { Bid };

export interface Config {
  apiUri: string;
  subgraphUri: string;
  zAuctionAddress: string;
  zAuctionLegacyAddress: string;
  wildTokenAddress: string;
  znsHubAddress: string;
  web3Provider: ethers.providers.Web3Provider;
}

export interface Instance {
  listSales: (tokenId: string) => Promise<TokenSale[]>;
  listBuyNowSales: (tokenId: string) => Promise<TokenBuy[]>;
  listAllSales: () => Promise<TokenSaleCollection>;
  listBids: (tokenIds: string[]) => Promise<TokenBidCollection>;
  listBidsByAccount: (account: string) => Promise<Bid[]>;
  placeBid: (
    params: NewBidParameters,
    signer: ethers.Signer,
    statusCallback?: PlaceBidStatusCallback
  ) => Promise<void>;
  isZAuctionApprovedToTransferNftByBid: (
    account: string,
    bid: Bid
  ) => Promise<boolean>;
  isZAuctionApprovedToTransferNftByDomain: (
    account: string,
    tokenId: string
  ) => Promise<boolean>;
  isZAuctionLegacyApprovedToTransferNft: (
    account: string,
    tokenId: string,
  ) => Promise<boolean>;
  getZAuctionSpendAllowanceByBid: (
    account: string,
    bid: Bid
  ) => Promise<ethers.BigNumber>;
  getZAuctionSpendAllowanceByDomain: (
    account: string,
    tokenId: string
  ) => Promise<ethers.BigNumber>;
  getZAuctionSpendAllowance: (
    account: string,
    paymentTokenAddress: string
  ) => Promise<ethers.BigNumber>;
  getZAuctionLegacySpendAllowance: (
    account: string
  ) => Promise<ethers.BigNumber>;
  setNetworkPaymentToken: (
    networkId: string,
    domainNetworkToken: string,
    signer: ethers.Signer
  ) => Promise<ethers.ContractTransaction>;
  getPaymentTokenForDomain: (domainTokenId: string) => Promise<string>;
  approveZAuctionSpendPaymentTokenByBid: (
    bid: Bid,
    signer: ethers.Signer
  ) => Promise<ethers.ContractTransaction>;
  approveZAuctionSpendPaymentTokenByDomain: (
    tokenId: string,
    signer: ethers.Signer
  ) => Promise<ethers.ContractTransaction>;
  approveZAuctionSpendPaymentToken: (
    paymentTokenAddress: string,
    signer: ethers.Signer
  ) => Promise<ethers.ContractTransaction>;
  approveZAuctionTransferNftByBid: (
    bid: Bid,
    signer: ethers.Signer
  ) => Promise<ethers.ContractTransaction>;
  approveZAuctionTransferNftByDomain: (
    tokenId: string,
    signer: ethers.Signer
  ) => Promise<ethers.ContractTransaction>;
  acceptBid: (
    bid: Bid,
    signer: ethers.Signer
  ) => Promise<ethers.ContractTransaction>;
  cancelBid: (
    bid: Bid,
    cancelOnChain: boolean,
    signer: ethers.Signer
  ) => Promise<ethers.ContractTransaction | void>;
  buyNow: (
    params: BuyNowParams,
    signer: ethers.Signer
  ) => Promise<ethers.ContractTransaction>;
  getBuyNowPrice: (tokenId: string) => Promise<BuyNowListing>;
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
  bidNonce: string;
  tokenId: string;
  saleAmount: string;
  buyer: string;
  seller: string;
  timestamp: string;
  paymentToken: string;
  topLevelDomainId: string;
}

export interface TokenBuy {
  buyer: string;
  seller: string;
  amount: string;
  contract: string;
  tokenId: string;
  timestamp: string;
  paymentToken: string;
  topLevelDomainId: string;
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
  paymentToken: string;
}

export interface BuyNowListing {
  price: ethers.BigNumber;
  holder: string;
  paymentToken: string;
}
