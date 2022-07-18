import { ethers } from "ethers";
import { getERC20Contract } from "../contracts";
import { IERC20 } from "../contracts/types";
import { getLogger } from "../utilities";

const logger = getLogger("actions:getPaymentTokenAllowance");

// Return the amount the given account has allowed zAuction to spend on its behalf
export const getPaymentTokenAllowance = async (
  account: string,
  paymentTokenAddress: string,
  provider: ethers.providers.Provider | ethers.Signer,
  zAuctionAddress: string
): Promise<ethers.BigNumber> => {
  logger.trace(
    `Calling to get allowance for user ${account} with payment token ${paymentTokenAddress}`
  );
  const paymentToken: IERC20 = await getERC20Contract(
    provider,
    paymentTokenAddress
  );
  const allowance = await paymentToken.allowance(account, zAuctionAddress);

  logger.trace(
    `User ${account} has allowance of ${ethers.utils
      .formatEther(allowance)
      .toString()} for payment token ${paymentToken}`
  );
  return allowance;
};
