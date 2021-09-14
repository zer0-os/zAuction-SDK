import {
  Bid,
  BidParameters,
  SignableBid,
  SignedBid,
  TokenBidCollection,
} from "../types";
import * as actions from "./actions";

export interface ApiClient {
  encodeBid: (bidParams: BidParameters) => Promise<SignableBid>;
  submitBid: (signedBid: SignedBid) => Promise<void>;
  listBidsForTokens: (
    contract: string,
    tokenIds: string[]
  ) => Promise<TokenBidCollection>;
  listBidsByAccount: (contract: string, account: string) => Promise<Bid[]>;
}

export const createClient = (apiUri: string): ApiClient => {
  const apiClient: ApiClient = {
    encodeBid: async (bidParams: BidParameters): Promise<SignableBid> =>
      actions.encodeBid(apiUri, bidParams),
    submitBid: (signedBid: SignedBid): Promise<void> =>
      actions.submitBid(apiUri, signedBid),
    listBidsForTokens: (
      contract: string,
      tokenIds: string[]
    ): Promise<TokenBidCollection> =>
      actions.listBidsForTokens(apiUri, contract, tokenIds),
    listBidsByAccount: (contract: string, account: string): Promise<Bid[]> =>
      actions.listBidsForAccount(apiUri, contract, account),
  };

  return apiClient;
};
