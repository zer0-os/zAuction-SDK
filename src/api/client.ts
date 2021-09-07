import {
  Bid,
  BidParameters,
  SignableBid,
  SignedBid,
  TokenBids,
} from "../types";

export interface ApiClient {
  encodeBid: (bidParams: BidParameters) => Promise<SignableBid>;
  submitBid: (signedBid: SignedBid) => Promise<Bid>;
  listBidsForTokens: (
    contract: string,
    tokenId: string[]
  ) => Promise<TokenBids>;
  listBidsByAccount: (contract: string, account: string) => Promise<Bid[]>;
}

export const createClient = (apiUri: string) => {
  const apiClient: ApiClient = {
    encodeBid: async (bidParams: BidParameters): Promise<SignableBid> => {
      throw Error(`Not Implemented`);
    },
    submitBid: (signedBid: SignedBid): Promise<Bid> => {
      throw Error(`Not Implemented`);
    },
    listBidsForTokens: (
      contract: string,
      tokenId: string[]
    ): Promise<TokenBids> => {
      throw Error(`Not Implemented`);
    },
    listBidsByAccount: (contract: string, account: string): Promise<Bid[]> => {
      throw Error(`Not Implemented`);
    },
  };

  return apiClient;
};
