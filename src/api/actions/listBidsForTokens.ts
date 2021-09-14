import { TokenBidCollection } from "../../types";
import { BidDto } from "../types";
import { calculateNftId, convertBidDtoToBid, makeApiCall } from "./helpers";

interface BidsBulkDto {
  nftBids: {
    [tokenId: string]: BidDto[];
  };
}

export const listBidsForTokens = async (
  apiUrl: string,
  contract: string,
  tokenIds: string[]
): Promise<TokenBidCollection> => {
  const bidCollection: TokenBidCollection = {};
  const uri = `${apiUrl}/bids/list`;

  const response = await makeApiCall<BidsBulkDto>(uri, "POST", {
    nftIds: tokenIds.map((e) => calculateNftId(contract, e)),
  });

  for (const [tokenId, bids] of Object.entries(response.nftBids)) {
    bidCollection[tokenId] = bids.map((e) => convertBidDtoToBid(e));
  }

  return bidCollection;
};
