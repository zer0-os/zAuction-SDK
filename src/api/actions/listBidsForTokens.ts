import { TokenBidCollection } from "../../types";
import { BidDto } from "../types";
import { convertBidDtoToBid, makeApiCall } from "./helpers";

import { getLogger } from "../../utilities";

const logger = getLogger("api:actions:listBidsForTokens");

interface BidsBulkDto {
  [tokenId: string]: BidDto[];
}

export const listBidsForTokens = async (
  apiUrl: string,
  tokenIds: string[]
): Promise<TokenBidCollection> => {
  const bidCollection: TokenBidCollection = {};
  const uri = `${apiUrl}/bids/list`;
  logger.trace(`Calling ${uri} to get bids for ${tokenIds.length} domains`);
  const response = await makeApiCall<BidsBulkDto>(uri, "POST", {
    tokenIds,
  });

  let totalBidsForDomains = 0;
  for (const [tokenId, bids] of Object.entries(response)) {
    bidCollection[tokenId] = bids.map((e) => convertBidDtoToBid(e));
    totalBidsForDomains += bids.length;
  }
  logger.trace(`Found ${totalBidsForDomains} bids for $${tokenIds.length} domains`);

  return bidCollection;
};
