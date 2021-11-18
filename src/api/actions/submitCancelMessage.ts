import { makeApiCall } from "./helpers";

export const submitCancelMessage = async (
  apiUrl: string,
  signedCancelMessage: string,
  signedBidMessage: string
): Promise<void> => {
  const uri = `${apiUrl}/bid/cancel`;

  const softFailMessage =
    "Already cancelled in the API but allowing execution to continue to cancel in the contract as well";

  // Soft fail if the bid isn't found in the API
  await makeApiCall(
    uri,
    "POST",
    {
      cancelMessageSignature: signedCancelMessage,
      bidMessageSignature: signedBidMessage,
    },
    true,
    softFailMessage
  );
};
