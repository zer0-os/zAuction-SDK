import { TokenBidCollection, TokenBidFilter } from "../../types";
import { BidDto } from "../types";
import { convertBidDtoToBid, makeApiCall } from "./helpers";

import { getLogger } from "../../utilities";

const logger = getLogger("api:actions:listBidsForTokens");

interface BidsBulkDto {
  [tokenId: string]: BidDto[];
}

export const listBidsForTokens = async (
  apiUrl: string,
  wildTokenAddress: string,
  tokenIds: string[],
  filter?: TokenBidFilter
): Promise<TokenBidCollection> => {
  const bidCollection: TokenBidCollection = {};
  let uri = `${apiUrl}/bids/list`;
  uri = filter ? uri.concat(`?filter=${filter}`) : uri;
  logger.trace(`Calling ${uri} to get bids for ${tokenIds.length} domains`);
  const response = await makeApiCall<BidsBulkDto>(uri, "POST", {
    tokenIds,
  });

  let totalBidsForDomains = 0;
  for (const [tokenId, bids] of Object.entries(response)) {
    bidCollection[tokenId] = bids.map((e) =>
      convertBidDtoToBid(e, wildTokenAddress)
    );
    totalBidsForDomains += bids.length;
  }
  logger.trace(
    `Found ${totalBidsForDomains} bids for $${tokenIds.length} domains`
  );

  return bidCollection;
};
