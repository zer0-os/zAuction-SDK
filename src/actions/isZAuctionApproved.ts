import { ethers } from "ethers";
import { IERC20, IERC721 } from "../contracts/types";

export const isZAuctionApprovedNftTransfer = async (
  account: string,
  zAuctionAddress: string,
  nftContract: IERC721
): Promise<boolean> => {
  const isApproved = await nftContract.isApprovedForAll(
    account,
    zAuctionAddress
  );
  return isApproved;
};

export const getZAuctionTradeTokenAllowance = async (
  account: string,
  zAuctionAddress: string,
  erc20Contract: IERC20
): Promise<ethers.BigNumber> => {
  const allowance = await erc20Contract.allowance(account, zAuctionAddress);

  return allowance;
};
