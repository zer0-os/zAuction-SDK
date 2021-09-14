import * as subgraph from "./subgraph";
import * as api from "./api";

import {
  TokenSale,
  TokenBidCollection,
  Bid,
  BidParameters,
  SignableBid,
  SignedBid,
} from "./types";

export * from "./types";

export interface Instance {
  listSales: (tokenId: string) => Promise<TokenSale[]>;
  listBids: (tokenIds: string[]) => Promise<TokenBidCollection>;
  listBidsByAccount: (account: string) => Promise<Bid[]>;
  encodeBid: (bidParams: BidParameters) => Promise<SignableBid>;
  submitBid: (signedBid: SignedBid) => Promise<void>;
}

export const createInstance = (
  apiUri: string,
  subgraphUri: string,
  zAuctionAddress: string
): Instance => {
  const subgraphClient: subgraph.SubgraphClient =
    subgraph.createClient(subgraphUri);

  const apiClient: api.ApiClient = api.createClient(apiUri);

  const instance: Instance = {
    listSales: (tokenId: string) =>
      subgraphClient.listSales(zAuctionAddress, tokenId),
    listBids: (tokenIds: string[]) =>
      apiClient.listBidsForTokens(zAuctionAddress, tokenIds),
    listBidsByAccount: (account: string) =>
      apiClient.listBidsByAccount(zAuctionAddress, account),
    encodeBid: apiClient.encodeBid,
    submitBid: apiClient.submitBid,
  };

  return instance;
};
