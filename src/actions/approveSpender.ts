import { ethers } from "ethers";
import { getERC20Contract } from "../contracts";
import { IERC20, } from "../contracts/types";

// Approve zAuction to spend ERC20 tokens on behalf of the signer
export const approveSpender = async (
  paymentTokenAddress: string,
  zAuctionAddress: string,
  signer: ethers.Signer
): Promise<ethers.ContractTransaction> => {
  const paymentToken: IERC20 = await getERC20Contract(signer, paymentTokenAddress);
  const tx = await paymentToken.connect(signer).approve(zAuctionAddress, ethers.constants.MaxUint256);

  return tx;
};
