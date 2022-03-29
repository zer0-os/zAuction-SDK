import { ethers } from "ethers";
import { getZAuctionContract, getZAuctionV1Contract } from "../contracts";
import { Bid, Config } from "../types";

export const acceptBid = async (
  bid: Bid,
  signer: ethers.Signer,
  config: Config
): Promise<ethers.ContractTransaction> => {
  // TODO move to archive or delete a bid when accepted
  // If not explicitly v2 bid, then assume v1
  const isVersion2 = bid.version === "2.0";

  // route to legacy if version 1.0
  const zAuctionAddress = isVersion2
    ? config.zAuctionAddress
    : config.zAuctionLegacyAddress;

  if (!isVersion2) {
    const zAuction = await getZAuctionV1Contract(signer, zAuctionAddress);

    const tx = await zAuction
      .connect(signer)
      .acceptBid(
        bid.signedMessage,
        bid.bidNonce,
        bid.bidder,
        bid.amount,
        config.tokenContract, // comment out for v2
        bid.tokenId,
        ethers.BigNumber.from("0"), // minimum bid as string
        bid.startBlock,
        bid.expireBlock,
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
