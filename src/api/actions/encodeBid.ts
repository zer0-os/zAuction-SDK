import { BidMessage, BidParameters, SignableBid } from "../types";
import { makeApiCall } from "./helpers";
import { getLogger } from "../../utilities";

const logger = getLogger("api:actions:encodeBid");

interface EncodeBidDto {
  payload: string;
  bidNonce: string;
  nftId: string;
}

export const encodeBid = async (
  apiUrl: string,
  bidParams: BidParameters
): Promise<SignableBid> => {
  const uri = `${apiUrl}/bid`;

  logger.trace(`Calling to encode a bid at ${uri} with ${bidParams}`);

  const response = await makeApiCall<EncodeBidDto>(uri, "POST", {
    bidAmount: bidParams.amount,
    tokenId: bidParams.tokenId,
    contractAddress: bidParams.contract,
    minimumBid: "0",
    startBlock: bidParams.startBlock,
    expireBlock: bidParams.expireBlock,
    bidToken: bidParams.bidToken,
  });

  const bidToSign: SignableBid = {
    bid: {
      bidNonce: response.bidNonce,
      ...bidParams,
    } as BidMessage,
    message: response.payload,
  };
  logger.trace(
    `Created bid to sign ${bidToSign.message} with bid nonce ${bidToSign.bid.bidNonce}`
  );
  return bidToSign;
};
