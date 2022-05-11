import { ethers } from "ethers";
import {
  getERC721Contract,
  getZAuctionContract,
  getZAuctionV1Contract,
  getZnsHubContract,
} from "../contracts";
import { IZNSHub, ZAuctionV1 } from "../contracts/types";
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

  const hub: IZNSHub = await getZnsHubContract(signer, config.znsHubAddress);
  const domainContract = await hub.getRegistrarForDomain(bid.tokenId);
  const nftContract = await getERC721Contract(signer, domainContract);

  const owner = await nftContract.ownerOf(bid.tokenId);
  const signerAddress = await signer.getAddress();

  if (owner !== signerAddress) {
    throw Error("Cannot accept a bid for a domain that is not yours");
  }
  if (owner === bid.bidder) {
    throw Error("Cannot sell to self");
  }

  if (!isVersion2) {
    const zAuctionV1: ZAuctionV1 = await getZAuctionV1Contract(
      signer,
      zAuctionAddress
    );
    const hub = await getZnsHubContract(
      config.web3Provider,
      config.znsHubAddress
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

    // const recreatedBid = await zAuctionV1.toEthSignedMessageHash(data);

    const recoveredAccount = await zAuctionV1.recover(
      data,
      bid.signedMessage
    );

    if (recoveredAccount !== bid.bidder) {
      throw Error("Recovered the incorrect account");
    }
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
      bid.expireBlock,
      {
        gasLimit: 500000,
      }
    );
    const receipt = await tx.wait(1);
    console.log(receipt.transactionHash);
    return tx;
  }

  const zAuction = await getZAuctionContract(signer, zAuctionAddress);

  if (!bid.bidToken) {
    // If version is 2.0 but there is still no bidToken it's v2 not v2.1
    const tx = await zAuction.connect(signer).acceptBid(
      bid.signedMessage,
      bid.bidNonce,
      bid.bidder,
      bid.amount,
      bid.tokenId,
      "0", // minimum bid as string
      bid.startBlock,
      bid.expireBlock,
      {
        gasLimit: 500000
      }
    );
    const receipt = await tx.wait(1);
    console.log(receipt.transactionHash)

    return tx;
  }

  // Otherwise, it is v2.1
  const tx = await zAuction.connect(signer).acceptBidV2(
    bid.signedMessage,
    bid.bidNonce,
    bid.bidder,
    bid.amount,
    bid.tokenId,
    "0", // minimum bid as string
    bid.startBlock,
    bid.expireBlock,
    bid.bidToken!,
    {
      gasLimit: 500000
    }
  );
  const receipt = await tx.wait(1);
  console.log(receipt);

  return tx;
};
