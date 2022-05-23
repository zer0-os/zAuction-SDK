import { makeApiCall } from "./helpers";
import { getLogger } from "../../utilities";

const logger = getLogger("api:actions:encodeCancelMessage");

interface EncodeCancelBidDto {
  hashedCancelMessage: string;
}

export const encodeCancelMessage = async (
  apiUrl: string,
  signedBidMessage: string
): Promise<string> => {
  const uri = `${apiUrl}/bid/cancel/encode`;
  logger.trace(
    `Calling to encode a cancel message at ${uri} for bid with a signed message of ${signedBidMessage}`
  );
  const response = await makeApiCall<EncodeCancelBidDto>(uri, "POST", {
    bidMessageSignature: signedBidMessage,
  });

  logger.trace(`Created message ${response.hashedCancelMessage} for signing`);
  return response.hashedCancelMessage;
};
