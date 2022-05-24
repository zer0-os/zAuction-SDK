import { ethers } from "ethers";
import { getERC20Contract } from "../contracts";
import { IERC20, } from "../contracts/types";
import { getLogger } from "../utilities";

const logger = getLogger("actions:approveSpender");

// Approve zAuction to spend ERC20 tokens on behalf of the signer
export const approveSpender = async (
  paymentTokenAddress: string,
  zAuctionAddress: string,
  signer: ethers.Signer
): Promise<ethers.ContractTransaction> => {
  const signerAddress = await signer.getAddress();

  const paymentToken: IERC20 = await getERC20Contract(signer, paymentTokenAddress);
  const tx = await paymentToken.connect(signer).approve(zAuctionAddress, ethers.constants.MaxUint256);
  logger.trace(
    `User ${signerAddress} has approved zAuction to spend ${paymentToken}`
  );
  return tx;
};
