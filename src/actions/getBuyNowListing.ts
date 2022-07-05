import { ethers } from "ethers";
import {
  getERC721Contract,
  getZAuctionContract,
  getZnsHubContract,
} from "../contracts";
import { BuyNowListing, Config } from "../types";
import { Maybe, getLogger } from "../utilities";

const logger = getLogger("actions:getBuyNowListing");

export const getBuyNowListing = async (
  tokenId: string,
  config: Config
): Promise<Maybe<BuyNowListing>> => {
  if (!tokenId) throw Error("Must provide a valid tokenId");

  const contract = await getZAuctionContract(
    config.web3Provider,
    config.zAuctionAddress
  );

  const hub = await getZnsHubContract(
    config.web3Provider,
    config.znsHubAddress
  );

  const registrarAddress = await hub.getRegistrarForDomain(tokenId);

  const tokenContract = await getERC721Contract(
    config.web3Provider,
    registrarAddress
  );

  const owner = await tokenContract.ownerOf(tokenId);
  const listing: BuyNowListing = await contract.priceInfo(tokenId);

  if (listing.holder !== owner) {
    logger.trace(
      `Domain with ID ${tokenId} has changed owners since this buyNow listing was created so it is invalid`
    );
    return undefined;
  }

  if (listing.price.eq("0")) {
    logger.trace(
      `Domain with ID ${tokenId} is currently not listed for buyNow`
    );
    return undefined;
  }

  if (listing.paymentToken === ethers.constants.AddressZero) {
    // Object is readonly, must make a new listing with payment token info
    const newListing: BuyNowListing = {
      holder: listing.holder,
      price: listing.price,
      paymentToken: config.wildTokenAddress,
    };
    return newListing;
  }

  return listing;
};
