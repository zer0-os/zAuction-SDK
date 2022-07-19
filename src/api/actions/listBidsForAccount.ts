import { Bid } from "../../types";
import { BidDto } from "../types";
import { convertBidDtoToBid, makeApiCall } from "./helpers";
import { getLogger } from "../../utilities";

const logger = getLogger("api:actions:listBidsForAccount");

type AccountBidsDto = BidDto[];

export const listBidsForAccount = async (
  apiUrl: string,
  account: string,
  wildTokenAddress: string
): Promise<Bid[]> => {
  const uri = `${apiUrl}/bids/accounts/${account}`;
  logger.trace(`Calling ${uri} to get bids for account ${account}`);
  const response = await makeApiCall<AccountBidsDto>(uri, "GET");

  const bids: Bid[] = response.map((e) =>
    convertBidDtoToBid(e, wildTokenAddress)
  );
  logger.trace(`Found ${bids.length} bids created by $${account}`);
  return bids;
};
