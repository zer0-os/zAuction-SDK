import { TokenBidCollection } from "../../types";
import { BidDto } from "../types";
import { convertBidDtoToBid, makeApiCall } from "./helpers";

interface BidsBulkDto {
  nftBids: {
    [tokenId: string]: BidDto[];
  };
}

export const listBidsForTokens = async (
  apiUrl: string,
  tokenIds: string[]
): Promise<TokenBidCollection> => {
  const bidCollection: TokenBidCollection = {};
  const uri = `${apiUrl}/bids/list`;

  const response = await makeApiCall<BidsBulkDto>(uri, "POST", {
    nftIds: tokenIds,
  });

  for (const [tokenId, bids] of Object.entries(response.nftBids)) {
    bidCollection[tokenId] = bids.map((e) => convertBidDtoToBid(e));
  }

  return bidCollection;
};
