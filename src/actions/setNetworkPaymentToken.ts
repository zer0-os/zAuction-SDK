import { ethers } from "ethers";
import { getZAuctionContract, getZnsHubContract } from "../contracts";
import { Config } from "../types";
import { getLogger } from "../utilities";

const logger = getLogger("sdk:actions:setNetworkPaymentToken");

export const setNetworkPaymentToken = async (
  networkId: string,
  paymentToken: string,
  signer: ethers.Signer,
  config: Config
): Promise<ethers.ContractTransaction> => {
  logger.trace(
    `Calling to set network payment token for ${networkId} with ${paymentToken}`
  );
  const contract = await getZAuctionContract(
    config.web3Provider,
    config.zAuctionAddress
  );
  const hub = await getZnsHubContract(
    config.web3Provider,
    config.znsHubAddress
  );
  const parent = await hub.parentOf(networkId);

  if (!parent.eq(ethers.constants.HashZero)) {
    throw Error("Can only set network payment tokens on network domains");
  }
  const zAuctionOwner = await contract.owner();
  const signerAddress = await signer.getAddress();

  if (signerAddress !== zAuctionOwner) {
    throw Error(
      "Cannot set a network's token for zAuction if you are not the owner"
    );
  }

  const tx = await contract
    .connect(signer)
    .setNetworkToken(networkId, paymentToken);
  logger.trace(
    `Call to setNetwnetwork payment token for ${networkId} with ${paymentToken}`
  );
  return tx;
};
