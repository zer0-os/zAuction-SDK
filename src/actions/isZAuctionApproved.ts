import { IERC721 } from "../contracts/types";
import { getLogger } from "../utilities";

const logger = getLogger("actions:isZAuctionApprovedNftTransfer");

// Check whether or not zAuction is approved to transfer NFTs for the user
export const isZAuctionApprovedNftTransfer = async (
  account: string,
  zAuctionAddress: string,
  nftContract: IERC721
): Promise<boolean> => {
  const isApproved = await nftContract.isApprovedForAll(
    account,
    zAuctionAddress
  );
  logger.trace(
    `User ${account} has approved zAuction to transfer NFTs: ${isApproved}`
  );
  return isApproved;
};
