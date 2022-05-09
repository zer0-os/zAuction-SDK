import { ethers } from "ethers";
import {
  getERC721Contract,
  getZAuctionContract,
  getZnsHub,
} from "../contracts";
import { ZAuction } from "../contracts/types";
import { BuyNowParams, Config, Listing } from "../types";
import { getPaymentTokenAllowance } from "./getPaymentTokenAllowance";
import { isZAuctionApprovedNftTransfer } from "./isZAuctionApproved";

// Perform an immediate buy, supporting legacy domain listings
export const buyNow = async (
  params: BuyNowParams,
  signer: ethers.Signer,
  config: Config
) => {
  const hub = await getZnsHub(signer, config.znsHubAddress);
  const tokenContract = await hub.getRegistrarForDomain(params.tokenId);

  const nftContract = await getERC721Contract(signer, tokenContract);

  const seller = await nftContract.ownerOf(params.tokenId);

  const isApproved = await isZAuctionApprovedNftTransfer(
    seller,
    config.zAuctionAddress,
    nftContract
  );

  if (!isApproved) {
    throw Error("Seller did not approve zAuction to transfer NFT");
  }

  const buyer = await signer.getAddress();

  if (seller === buyer) {
    throw Error("Cannot sell a domain to yourself");
  }

  const zAuction: ZAuction = await getZAuctionContract(
    signer,
    config.zAuctionAddress
  );

  const listing: Listing = await zAuction.priceInfo(params.tokenId);

  if (listing.price.eq("0")) {
    throw Error("Domain is not for sale");
  }
  if (!listing.price.eq(params.amount)) {
    throw Error("Incorrect buyNow price given");
  }

  if (!listing.paymentToken) {
    // If no bidToken it is not a v2.1 listing, use WILD
    const allowance = await getPaymentTokenAllowance(
      buyer,
      config.wildTokenAddress,
      config.web3Provider,
      config.zAuctionAddress
    );

    // Ensure buyer has approved zAuction to transfer tokens on their behalf
    if (allowance.lt(params.amount)) {
      throw Error("zAuction is not approved to transfer this many tokens");
    }

    const tx = await zAuction
      .connect(signer)
      .buyNow(params.amount, params.tokenId);

    return tx;
  }

  const allowance = await getPaymentTokenAllowance(
    buyer,
    listing.paymentToken!,
    config.web3Provider,
    config.zAuctionAddress
  );

  // Ensure buyer has approved zAuction to transfer tokens on their behalf
  if (allowance.lt(params.amount)) {
    throw Error("zAuction is not approved to transfer this many tokens");
  }

  const tx = await zAuction
    .connect(signer)
    .buyNowV2(params.amount, params.tokenId);

  return tx;
};
