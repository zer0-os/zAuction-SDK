import { ethers } from "ethers";
import { getERC721Contract } from "../contracts";

// Approve zAuction to transfer domains on behalf of the signer
export const approveDomainTransfer = async (
  domainContractAddress: string,
  zAuctionAddress: string,
  signer: ethers.Signer
): Promise<ethers.ContractTransaction> => {
    const nftContract = await getERC721Contract(signer, domainContractAddress);

    const tx = await nftContract
      .connect(signer)
      .setApprovalForAll(zAuctionAddress, true);

    return tx;
};
