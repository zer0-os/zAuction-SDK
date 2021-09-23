import { TokenBidCollection } from "../../types";
import { BidDto } from "../types";
import { calculateNftId, convertBidDtoToBid, makeApiCall } from "./helpers";

interface BidsBulkDto {
  [tokenId: string]: BidDto[];
}

export const listBidsForTokens = async (
  apiUrl: string,
  contract: string,
  tokenIds: string[]
): Promise<TokenBidCollection> => {
  const bidCollection: TokenBidCollection = {};
  const uri = `${apiUrl}/bids/list`;

  const nftIdToTokenId: { [nftId: string]: string } = {};
  const nftIds: string[] = tokenIds.map((e) => {
    const nftId = calculateNftId(contract, e);
    nftIdToTokenId[nftId] = e;
    return nftId;
  });

  const response = await makeApiCall<BidsBulkDto>(uri, "POST", {
    nftIds,
  });

  for (const [nftId, bids] of Object.entries(response)) {
    const tokenId = nftIdToTokenId[nftId];
    bidCollection[tokenId] = bids.map((e) => convertBidDtoToBid(e));
  }

  return bidCollection;
};
