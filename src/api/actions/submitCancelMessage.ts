import { makeApiCall } from "./helpers";

export const submitCancelMessage = async (
  apiUrl: string,
  signedCancelMessage: string,
  signedBidMessage: string
): Promise<void> => {
  const uri = `${apiUrl}/bid/cancel`;

  // Soft fail if the bid isn't found
  await makeApiCall(uri, "POST", {
    cancelMessageSignature: signedCancelMessage,
    bidMessageSignature: signedBidMessage,
  }, true);
};
