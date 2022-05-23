import { ethers } from "ethers";
import { getERC721Contract } from "../contracts";

import { getLogger } from "../utilities";

const logger = getLogger("actions:approveDomainTransfer");

// Approve zAuction to transfer domains on behalf of the signer
export const approveDomainTransfer = async (
  domainContractAddress: string,
  zAuctionAddress: string,
  signer: ethers.Signer
): Promise<ethers.ContractTransaction> => {
  const signerAddress = await signer.getAddress();
  const nftContract = await getERC721Contract(signer, domainContractAddress);

  const tx = await nftContract
    .connect(signer)
    .setApprovalForAll(zAuctionAddress, true);

  logger.trace(
    `User ${signerAddress} has approved zAuction to transfer domains from ${domainContractAddress}`
  );
  return tx;
};
