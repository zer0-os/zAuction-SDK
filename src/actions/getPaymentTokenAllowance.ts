import { ethers } from "ethers";
import { getERC20Contract } from "../contracts";
import { IERC20 } from "../contracts/types";

// Return the amount the given account has allowed zAuction to spend on its behalf
export const getPaymentTokenAllowance = async (
    account: string,
    paymentTokenAddress: string,
    provider: ethers.providers.Provider | ethers.Signer,
    zAuctionAddress: string
  ): Promise<ethers.BigNumber> => {
    const paymentToken: IERC20 = await getERC20Contract(provider, paymentTokenAddress);
    const allowance = await paymentToken.allowance(account, zAuctionAddress);

    return allowance;
  };