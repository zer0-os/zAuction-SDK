import { makeApiCall } from "./helpers";
import { getLogger } from "../../utilities";

const logger = getLogger("api:actions:submitBid");

export const submitCancelMessage = async (
  apiUrl: string,
  signedCancelMessage: string,
  signedBidMessage: string
): Promise<void> => {
  const uri = `${apiUrl}/bid/cancel`;
  logger.trace(
    `Calling ${uri} to submit cancelled bid with signed message${signedCancelMessage}}`
  );

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
