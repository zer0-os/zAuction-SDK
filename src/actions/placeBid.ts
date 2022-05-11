import { ethers } from "ethers";
import { BidParameters, SignableBid, SignedBid } from "../api/types";
import { getZAuctionContract, getZnsHubContract } from "../contracts";

import {
  PlaceBidStatus,
  PlaceBidStatusCallback,
  NewBidParameters,
  Config,
} from "../types";
import { Maybe } from "../utilities";

type SignMessageFunction = (
  message: string | ethers.utils.Bytes
) => Promise<string>;
type EncodeBidFunction = (bidParams: BidParameters) => Promise<SignableBid>;
type SubmitBidFunction = (signedBid: SignedBid) => Promise<void>;

export interface PlaceBidActionParameters {
  bid: NewBidParameters;
  config: Config,
  bidder: string;
  encodeBid: EncodeBidFunction;
  signMessage: SignMessageFunction;
  submitBid: SubmitBidFunction;
  statusCallback?: PlaceBidStatusCallback;
}

export const placeBid = async (
  params: PlaceBidActionParameters
): Promise<void> => {
  params.statusCallback ? params.statusCallback(PlaceBidStatus.Encoding) : null;

  const hub = await getZnsHubContract(
    params.config.web3Provider,
    params.config.znsHubAddress
  );
  const registrar = await hub.getRegistrarForDomain(params.bid.tokenId);
  
  const contract = await getZAuctionContract(params.config.web3Provider, params.config.zAuctionAddress);
  const paymentToken = await contract.getPaymentTokenForDomain(params.bid.tokenId);

  let signableBid: Maybe<SignableBid>;
  
  const bidParams: BidParameters = {
    bidder: params.bidder,
    tokenId: params.bid.tokenId,
    contract: registrar,
    amount: params.bid.bidAmount,
    startBlock: params.bid.startBlock ?? "0",
    expireBlock: params.bid.expireBlock ?? "9999999999",
    bidToken: paymentToken
  }
  try {
    signableBid = await params.encodeBid(bidParams);
  } catch (e) {
    throw Error(`Failed to encode bid: ${e}`);
  }

  params.statusCallback ? params.statusCallback(PlaceBidStatus.Signing) : null;

  let signedBidMessage: Maybe<string>;
  try {
    signedBidMessage = await params.signMessage(
      ethers.utils.arrayify(signableBid.message)
    );
  } catch (e) {
    throw Error(`Failed to sign bid message: ${e}`);
  }

  params.statusCallback
    ? params.statusCallback(PlaceBidStatus.Submitting)
    : null;

  try {
    await params.submitBid({
      bid: signableBid.bid,
      signedMessage: signedBidMessage,
    } as SignedBid);
  } catch (e) {
    throw Error(`Failed to submit bid: ${e}`);
  }

  params.statusCallback
    ? params.statusCallback(PlaceBidStatus.Completed)
    : null;
};
