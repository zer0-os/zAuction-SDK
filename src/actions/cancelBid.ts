import { ethers } from "ethers";
import { ApiClient } from "../api";
import { getZAuctionContract, getZAuctionV1Contract, getZnsHub } from "../contracts";
import { Bid, Config } from "../types";

// Cancel a bid for a domain, supporting legacy bids
export const cancelBid = async (
  bid: Bid,
  cancelOnChain: boolean,
  apiClient: ApiClient,
  zAuctionAddress: string,
  signer: ethers.Signer
): Promise<ethers.ContractTransaction | void> => {

  const encodedCancelMessage = await apiClient.encodeCancelBid(
    bid.signedMessage
  );
  const signedCancelMessage = await signer.signMessage(
    encodedCancelMessage
  );
  
  // Always cancel the bid through the API
  await apiClient.submitCancelBid(signedCancelMessage, bid.signedMessage);

  // If enabled, also cancel the bid with the zAuction smart contract
  if (cancelOnChain) {
    const zAuction = await getZAuctionContract(
      signer,
      zAuctionAddress
    );

    const account = await signer.getAddress();

    const tx = await zAuction.connect(signer).cancelBid(account, bid.bidNonce);
    return tx;
  }
};
