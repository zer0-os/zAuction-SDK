import { SignedBid } from "../types";
import { makeApiCall } from "./helpers";

export const submitCancelMessage = async (
  apiUrl: string,
  signedCancelMessage: string,
  signedBidMessage: string
): Promise<void> => {
  const uri = `${apiUrl}/bid/cancel`;

  await makeApiCall(uri, "POST", {
    cancelMessageSignature: signedCancelMessage,
    bidMessageSignature: signedBidMessage,
  });
};
