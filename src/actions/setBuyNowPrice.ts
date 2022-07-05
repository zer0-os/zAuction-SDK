import { ethers } from "ethers";
import {
  getERC721Contract,
  getZAuctionContract,
  getZnsHubContract,
} from "../contracts";
import { IZNSHub } from "../contracts/types";
import { BuyNowParams } from "../types";

import { isZAuctionApprovedNftTransfer } from "./isZAuctionApproved";

export const setBuyNowPrice = async (
  params: BuyNowParams,
  signer: ethers.Signer,
  znsHubAddress: string,
  zAuctionAddress: string
): Promise<ethers.ContractTransaction> => {
  const hub: IZNSHub = await getZnsHubContract(signer, znsHubAddress);
  const domainContract = await hub.getRegistrarForDomain(params.tokenId);

  const nftContract = await getERC721Contract(signer, domainContract);

  const owner = await nftContract.ownerOf(params.tokenId);
  const givenSeller = await signer.getAddress();

  if (givenSeller !== owner) {
    throw Error("Cannot set the price of a domain that is not yours");
  }

  // Seller must have approved zAuction to transfer their NFT(s)
  // before being able to set a buy price
  const isApproved = await isZAuctionApprovedNftTransfer(
    owner,
    zAuctionAddress,
    nftContract
  );

  if (!isApproved) {
    throw Error("Seller did not approve zAuction to transfer NFT");
  }

  const contract = await getZAuctionContract(signer, zAuctionAddress);

  const listing = await contract.priceInfo(params.tokenId);

  if (listing.price.eq(params.amount)) {
    throw Error(
      "Unable to set price if a listing with that price already exists"
    );
  }

  const tx = await contract
    .connect(signer)
    .setBuyPrice(params.amount, params.tokenId);
  return tx;
};
