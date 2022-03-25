import { BidMessage, BidParameters, SignableBid } from "../types";
import { makeApiCall } from "./helpers";

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
  const response = await makeApiCall<EncodeBidDto>(uri, "POST", {
    bidAmount: bidParams.amount,
    tokenId: bidParams.tokenId,
    contractAddress: bidParams.contract,
    minimumBid: "0",
    startBlock: bidParams.startBlock,
    expireBlock: bidParams.expireBlock,
  });

  const bidToSign: SignableBid = {
    bid: {
      bidNonce: response.bidNonce,
      ...bidParams,
    } as BidMessage,
    message: response.payload,
  };

  return bidToSign;
};
