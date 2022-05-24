import { ethers } from "ethers";
import {
  getERC721Contract,
  getZAuctionContract,
  getZAuctionV1Contract,
  getZnsHubContract,
} from "../contracts";
import { IERC721, IZNSHub, ZAuction, ZAuctionV1 } from "../contracts/types";
import { Bid, Config } from "../types";
import { getLogger } from "../utilities";

const logger = getLogger("actions:acceptBid");

const verifyAccount = async (
  zAuction: ZAuction | ZAuctionV1,
  data: string,
  signedMessage: string,
  bidder: string
): Promise<void> => {
  const unsignedMessage = await zAuction.toEthSignedMessageHash(
    ethers.utils.arrayify(data)
  );

  const recoveredAccount = await zAuction.recover(
    unsignedMessage,
    signedMessage
  );

  if (recoveredAccount !== bidder) {
    throw Error("Recovered incorrect account");
  }
};

// Accept a bid for a domain, supporting legacy bids
export const acceptBid = async (
  bid: Bid,
  signer: ethers.Signer,
  config: Config
): Promise<ethers.ContractTransaction> => {
  logger.trace(
    `Calling to accept a bid by user ${bid.bidder} with bidNonce of ${bid.bidNonce}`
  );

  // If not explicitly v2 bid, then assume v1
  const isVersion2 = bid.version === "2.0";

  // route to legacy if version 1.0
  const zAuctionAddress = isVersion2
    ? config.zAuctionAddress
    : config.zAuctionLegacyAddress;

  const hub: IZNSHub = await getZnsHubContract(signer, config.znsHubAddress);
  const domainContract = await hub.getRegistrarForDomain(bid.tokenId);
  const nftContract: IERC721 = await getERC721Contract(signer, domainContract);

  const owner = await nftContract.ownerOf(bid.tokenId);
  const signerAddress = await signer.getAddress();

  if (owner !== signerAddress) {
    throw Error("Cannot accept a bid for a domain that is not yours");
  }
  if (owner === bid.bidder) {
    throw Error("Cannot sell to self");
  }

  if (isVersion2) {
    const zAuction: ZAuction = await getZAuctionContract(
      signer,
      zAuctionAddress
    );

    if (bid.bidToken) {
      // v2.1 bid
      logger.trace(
        `v2.1 Bid: Payment token for domain ${bid.tokenId} is ${bid.bidToken}`
      );

      const data = await zAuction.createBidV2(
        bid.bidNonce,
        bid.amount,
        bid.tokenId,
        "0",
        bid.startBlock,
        bid.expireBlock,
        bid.bidToken
      );

      await verifyAccount(zAuction, data, bid.signedMessage, bid.bidder);

      const tx = await zAuction.connect(signer).acceptBidV2(
        bid.signedMessage,
        bid.bidNonce,
        bid.bidder,
        bid.amount,
        bid.tokenId,
        "0", // minimum bid as string
        bid.startBlock,
        bid.expireBlock,
        bid.bidToken
      );

      return tx;
    }
    // v2.0 bid
    logger.trace(
      `v2.0 Bid: Payment token for domain ${bid.tokenId} is ${config.wildTokenAddress}`
    );
    const data = await zAuction.createBid(
      bid.bidNonce,
      bid.amount,
      bid.contract,
      bid.tokenId,
      "0",
      bid.startBlock,
      bid.expireBlock
    );

    await verifyAccount(zAuction, data, bid.signedMessage, bid.bidder);

    const tx = await zAuction.connect(signer).acceptBid(
      bid.signedMessage,
      bid.bidNonce,
      bid.bidder,
      bid.amount,
      bid.tokenId,
      "0", // minimum bid
      bid.startBlock,
      bid.expireBlock
    );
    return tx;
  }
  //v1 legacy bid
  const zAuctionV1: ZAuctionV1 = await getZAuctionV1Contract(
    signer,
    zAuctionAddress
  );

  logger.trace(
    `v1.0 Bid: Payment token for domain ${bid.tokenId} is ${config.wildTokenAddress}`
  );
  const data = await zAuctionV1.createBid(
    bid.bidNonce,
    bid.amount,
    bid.contract,
    bid.tokenId,
    "0",
    bid.startBlock,
    bid.expireBlock
  );

  await verifyAccount(zAuctionV1, data, bid.signedMessage, bid.bidder);

  // For any v1 bid this will always return the default registrar
  // const registrar = await hub.getRegistrarForDomain(bid.tokenId);
  const tx = await zAuctionV1.connect(signer).acceptBid(
    bid.signedMessage,
    bid.bidNonce,
    bid.bidder,
    bid.amount,
    bid.contract,
    bid.tokenId,
    "0", // minimum bid as string
    bid.startBlock,
    bid.expireBlock
  );
  return tx;
};
