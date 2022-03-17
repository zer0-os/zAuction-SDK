import { ethers } from "ethers";
import { Bid, BidParameters, SignableBid, SignedBid } from "../api/types";

import {
  PlaceBidStatus,
  PlaceBidStatusCallback,
  NewBidParameters,
} from "../types";
import { Maybe } from "../utilities";

type SignMessageFunction = (
  message: string | ethers.utils.Bytes
) => Promise<string>;
type EncodeBidFunction = (bidParams: BidParameters) => Promise<SignableBid>;
type SubmitBidFunction = (signedBid: SignedBid) => Promise<void>;

interface PlaceBidActionParameters {
  bid: NewBidParameters;
  contract: string;
  bidder: string;
  encodeBid: EncodeBidFunction;
  signMessage: SignMessageFunction;
  submitBid: SubmitBidFunction;
  statusCallback?: PlaceBidStatusCallback;
}

export const placeBid = async (
  params: PlaceBidActionParameters,
  signer: ethers.Signer
): Promise<Bid> => {
  params.statusCallback ? params.statusCallback(PlaceBidStatus.Encoding) : null;

  let signableBid: Maybe<SignableBid>;

  try {
    signableBid = await params.encodeBid({
      bidder: params.bidder,
      contract: params.contract,
      tokenId: params.bid.tokenId,
      amount: params.bid.bidAmount,
      startBlock: params.bid.startBlock ?? "0",
      expireBlock: params.bid.expireBlock ?? "9999999999",
    } as BidParameters);
  } catch (e) {
    console.error(e);
    throw Error(`Failed to encode bid: ${e}`);
  }

  params.statusCallback ? params.statusCallback(PlaceBidStatus.Signing) : null;

  let signedBidMessage: Maybe<string>;
  try {
    signedBidMessage = await signer.signMessage(
      ethers.utils.arrayify(signableBid.message)
    );
  } catch (e) {
    throw Error(`Failed to sign bid message: ${e}`);
  }

  params.statusCallback
    ? params.statusCallback(PlaceBidStatus.Submitting)
    : null;

  const signedBid = {
    bid: signableBid.bid,
    signedMessage: signedBidMessage,
  } as SignedBid;

  try {
    await params.submitBid(signedBid);
  } catch (e) {
    console.error(e);
    throw Error(`Failed to submit bid: ${e}`);
  }

  params.statusCallback
    ? params.statusCallback(PlaceBidStatus.Completed)
    : null;

  const createdBid: Bid = {
    ...signedBid.bid,
    signedMessage: signedBid.signedMessage,
    timestamp: new Date().getTime().toString(),
  };

  return createdBid;
};
