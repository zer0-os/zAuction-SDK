import { SignedBid } from "../types";
import { makeApiCall } from "./helpers";
import { getLogger } from "../../utilities";

const logger = getLogger("api:actions:submitBid");

export const submitBid = async (
  apiUrl: string,
  signedBid: SignedBid
): Promise<void> => {
  const uri = `${apiUrl}/bids`;
  logger.trace(
    `Calling ${uri} to submit bid with bid nonce ${signedBid.bid.bidNonce}}`
  );

  await makeApiCall(uri, "POST", {
    account: signedBid.bid.bidder,
    bidNonce: signedBid.bid.bidNonce,
    tokenId: signedBid.bid.tokenId,
    contractAddress: signedBid.bid.contract,
    bidAmount: signedBid.bid.amount,
    signedMessage: signedBid.signedMessage,
    minimumBid: "0",
    startBlock: signedBid.bid.startBlock,
    expireBlock: signedBid.bid.expireBlock,
    bidToken: signedBid.bid.bidToken,
  });
};
