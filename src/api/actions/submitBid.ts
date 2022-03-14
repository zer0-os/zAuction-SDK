import { SignedBid } from "../types";
import { makeApiCall } from "./helpers";

export const submitBid = async (
  apiUrl: string,
  signedBid: SignedBid
): Promise<void> => {
  const uri = `${apiUrl}/bids`;

  await makeApiCall(uri, "POST", {
    account: signedBid.bid.bidder,
    uniqueBidId: signedBid.bid.uniqueBidId,
    tokenId: signedBid.bid.tokenId,
    contractAddress: signedBid.bid.contract,
    bidAmount: signedBid.bid.amount,
    signedMessage: signedBid.signedMessage,
    minimumBid: "0",
    startBlock: signedBid.bid.startBlock,
    expireBlock: signedBid.bid.expireBlock,
  });
};
