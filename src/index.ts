import * as subgraph from "./subgraph";
import * as api from "./api";
import * as actions from "./actions";

import { ethers } from "ethers";

import {
  TokenSale,
  TokenBidCollection,
  PlaceBidStatusCallback,
  Bid,
  NewBidParameters,
  CurrencyToken,
} from "./types";
import { getERC721Contract, getZAuctionTradeToken } from "./contracts";

export * from "./types";

export interface Config {
  apiUri: string;
  subgraphUri: string;
  zAuctionAddress: string;
  tokenContract: string;
  web3Provider: ethers.providers.Web3Provider;
}

export interface Instance {
  listSales: (tokenId: string) => Promise<TokenSale[]>;
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
}

export const createInstance = (config: Config): Instance => {
  const subgraphClient: subgraph.SubgraphClient = subgraph.createClient(
    config.subgraphUri
  );

  const apiClient: api.ApiClient = api.createClient(config.apiUri);

  const instance: Instance = {
    listSales: (tokenId: string) =>
      subgraphClient.listSales(config.zAuctionAddress, tokenId),
    listBids: (tokenIds: string[]) =>
      apiClient.listBidsForTokens(config.zAuctionAddress, tokenIds),
    listBidsByAccount: (account: string) =>
      apiClient.listBidsByAccount(config.zAuctionAddress, account),
    placeBid: async (
      params: NewBidParameters,
      signer: ethers.Signer,
      statusCallback?: PlaceBidStatusCallback
    ) =>
      actions.placeBid({
        bid: params,
        contract: config.tokenContract,
        bidder: await signer.getAddress(),
        encodeBid: apiClient.encodeBid,
        signMessage: signer.signMessage,
        submitBid: apiClient.submitBid,
        statusCallback,
      }),
    isZAuctionApprovedToTransferNft: async (
      account: string
    ): Promise<boolean> => {
      const nftContract = await getERC721Contract(
        config.web3Provider,
        config.tokenContract
      );

      return await actions.isZAuctionApprovedNftTransfer(
        account,
        config.zAuctionAddress,
        nftContract
      );
    },
    getZAuctionSpendAllowance: async (
      account: string
    ): Promise<ethers.BigNumber> => {
      const erc20Token = await getZAuctionTradeToken(
        config.web3Provider,
        config.zAuctionAddress
      );

      const allowance = await actions.getZAuctionTradeTokenAllowance(
        account,
        config.zAuctionAddress,
        erc20Token
      );

      return allowance;
    },
    getTradeTokenAddress: async (): Promise<string> => {
      const erc20Token = await getZAuctionTradeToken(
        config.web3Provider,
        config.zAuctionAddress
      );

      return erc20Token.address;
    },
  };

  return instance;
};
