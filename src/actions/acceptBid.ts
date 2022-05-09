import { ethers } from "ethers";
import { getZAuctionContract, getZAuctionV1Contract, getZnsHub } from "../contracts";
import { Bid, Config } from "../types";

// Accept a bid for a domain, supporting legacy bids
export const acceptBid = async (
  bid: Bid,
  signer: ethers.Signer,
  config: Config
): Promise<ethers.ContractTransaction> => {
  // If not explicitly v2 bid, then assume v1
  const isVersion2 = bid.version === "2.0";

  // route to legacy if version 1.0
  const zAuctionAddress = isVersion2
    ? config.zAuctionAddress
    : config.zAuctionLegacyAddress;

  if (!isVersion2) {
    const zAuction = await getZAuctionV1Contract(signer, zAuctionAddress);
    const hub = await getZnsHub(config.web3Provider, config.znsHubAddress);

    // For any v1 bid this will always return the default registrar
    const registrar = await hub.getRegistrarForDomain(bid.tokenId);

    const tx = await zAuction.connect(signer).acceptBid(
      bid.signedMessage,
      bid.bidNonce, // auctionId for legacy bids
      bid.bidder,
      bid.amount,
      registrar,
      bid.tokenId,
      "0", // minimum bid as string
      bid.startBlock,
      bid.expireBlock
    );

    return tx;
  }

  const zAuction = await getZAuctionContract(signer, zAuctionAddress);

  // v2 bids use WILD
  // v2.1 bids use bid.bidToken
  const bidToken = bid.bidToken ?? config.wildTokenAddress;

  const tx = await zAuction
    .connect(signer)
    .acceptBidV2(
      bid.signedMessage,
      bid.bidNonce,
      bid.bidder,
      bid.amount,
      bid.tokenId,
      "0", // minimum bid as string
      bid.startBlock,
      bid.expireBlock,
      bidToken
    );

  return tx;
};
