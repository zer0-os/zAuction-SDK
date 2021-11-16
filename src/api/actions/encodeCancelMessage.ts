import { BidMessage, BidParameters, SignableBid } from "../types";
import { makeApiCall } from "./helpers";

interface EncodeCancelBidDto {
  hashedCancelMessage: string;
}

export const encodeCancelMessage = async (
  apiUrl: string,
  signedBidMessage: string
): Promise<string> => {
  const uri = `${apiUrl}/bid/encode/cancel`;
  const response = await makeApiCall<EncodeCancelBidDto>(uri, "GET", {
    bidMessageSignature: signedBidMessage,
  });

  return response.hashedCancelMessage;
};
