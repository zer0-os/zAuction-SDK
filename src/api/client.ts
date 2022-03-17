import { TokenBidCollection } from "../types";
import * as actions from "./actions";
import { Bid, BidParameters, SignableBid, SignedBid } from "./types";

export interface ApiClient {
  encodeBid: (bidParams: BidParameters) => Promise<SignableBid>;
  submitBid: (signedBid: SignedBid) => Promise<void>;
  encodeCancelBid: (signedBidMessage: string) => Promise<string>;
  submitCancelBid: (
    cancelMessageSignature: string,
    bidMessageSignature: string
  ) => Promise<void>;
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
    encodeCancelBid: async (signedBidMessage: string): Promise<string> =>
      actions.encodeCancelMessage(apiUri, signedBidMessage),
    submitCancelBid: async (
      signedCancelMessage: string,
      signedBidMessage: string
    ): Promise<void> =>
      actions.submitCancelMessage(
        apiUri,
        signedCancelMessage,
        signedBidMessage
      ),
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
