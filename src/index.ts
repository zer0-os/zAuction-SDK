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
} from "./types";

export * from "./types";

export interface Config {
  apiUri: string;
  subgraphUri: string;
  zAuctionAddress: string;
  tokenContract: string;
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
  };

  return instance;
};
