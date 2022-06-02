import { TokenBidCollection, TokenBidFilter } from "../types";
import * as actions from "./actions";
import { Bid, BidParameters, SignableBid, SignedBid } from "./types";
import { getLogger } from "../utilities";

export interface ApiClient {
  encodeBid: (bidParams: BidParameters) => Promise<SignableBid>;
  submitBid: (signedBid: SignedBid) => Promise<void>;
  encodeCancelBid: (signedBidMessage: string) => Promise<string>;
  submitCancelBid: (
    cancelMessageSignature: string,
    bidMessageSignature: string
  ) => Promise<void>;
  listBidsForTokens: (tokenIds: string[], filter?: TokenBidFilter) => Promise<TokenBidCollection>;
  listBidsByAccount: (account: string) => Promise<Bid[]>;
}

export const createClient = (apiUri: string): ApiClient => {
  const logger = getLogger("api:client");
  const apiClient: ApiClient = {
    encodeBid: async (bidParams: BidParameters): Promise<SignableBid> => {
      logger.debug(`Encode bid with params ${bidParams}`);
      return actions.encodeBid(apiUri, bidParams);
    },
    submitBid: (signedBid: SignedBid): Promise<void> => {
      logger.debug(`Submit bid with signed message ${signedBid.signedMessage}`);
      return actions.submitBid(apiUri, signedBid);
    },
    encodeCancelBid: async (signedBidMessage: string): Promise<string> => {
      logger.debug(`Encode to cancel a bid with signed message ${signedBidMessage}}`);
      return actions.encodeCancelMessage(apiUri, signedBidMessage)
    },
    submitCancelBid: async (
      signedCancelMessage: string,
      signedBidMessage: string
    ): Promise<void> => {
      logger.debug(`Submit cancelled bid with signed message ${signedCancelMessage}`);
      actions.submitCancelMessage(
        apiUri,
        signedCancelMessage,
        signedBidMessage
      );
    },
    listBidsForTokens: (tokenIds: string[], filter?: TokenBidFilter): Promise<TokenBidCollection> => {
      logger.debug(`List bids for domains ${tokenIds}`);
      return actions.listBidsForTokens(apiUri, tokenIds, filter)
    },
    listBidsByAccount: (account: string): Promise<Bid[]> => {
      logger.debug(`List bids by account ${account}`);
      return actions.listBidsForAccount(apiUri, account)
    }
  };

  return apiClient;
};
