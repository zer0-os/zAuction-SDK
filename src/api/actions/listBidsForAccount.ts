import { Bid } from "../../types";
import { BidDto } from "../types";
import { convertBidDtoToBid, makeApiCall } from "./helpers";

type AccountBidsDto = BidDto[];

export const listBidsForAccount = async (
  apiUrl: string,
  account: string
): Promise<Bid[]> => {
  const uri = `${apiUrl}/bids/account/${account}`;
  const response = await makeApiCall<AccountBidsDto>(uri, "GET");

  const bids: Bid[] = response.map((e) => convertBidDtoToBid(e));
  return bids;
};
