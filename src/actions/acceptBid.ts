import { ethers } from "ethers";
import { getZAuctionContract, getZAuctionV1Contract } from "../contracts";
import { Bid, Config } from "../types";

export const acceptBid = async (
  bid: Bid,
  signer: ethers.Signer,
  config: Config
): Promise<ethers.ContractTransaction> => {
  const isVersion1 = bid.version === "1.0";

  // route to legacy if version 1.0
  const zAuctionAddress = isVersion1
    ? config.zAuctionLegacyAddress
    : config.zAuctionAddress;

  if (isVersion1) {
    const zAuction = await getZAuctionV1Contract(signer, zAuctionAddress);

    const tx = await zAuction
      .connect(signer)
      .acceptBid(
        bid.signedMessage,
        bid.bidNonce,
        bid.bidder,
        bid.amount,
        config.tokenContract,
        bid.tokenId,
        0,
        bid.startBlock,
        bid.expireBlock
      );

    return tx;
  }

  const zAuction = await getZAuctionContract(signer, zAuctionAddress);

  const tx = await zAuction
    .connect(signer)
    .acceptBid(
      bid.signedMessage,
      bid.bidNonce,
      bid.bidder,
      bid.amount,
      bid.tokenId,
      0,
      bid.startBlock,
      bid.expireBlock
    );

  return tx;
};
