import { makeApiCall } from "./helpers";

interface EncodeCancelBidDto {
  hashedCancelMessage: string;
}

export const encodeCancelMessage = async (
  apiUrl: string,
  signedBidMessage: string
): Promise<string> => {
  const uri = `${apiUrl}/bid/cancel/encode`;
  const response = await makeApiCall<EncodeCancelBidDto>(uri, "POST", {
    bidMessageSignature: signedBidMessage,
  });

  return response.hashedCancelMessage;
};
