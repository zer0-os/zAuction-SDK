import * as subgraph from "./subgraph";
import * as api from "./api";
import * as actions from "./actions";

import { ethers } from "ethers";

import {
  PlaceBidStatusCallback,
  NewBidParameters,
  Config,
  Instance,
  Bid,
} from "./types";
import {
  getERC721Contract,
  getZAuctionContract,
  getZAuctionTradeToken,
} from "./contracts";

export * from "./types";

export const createInstance = (config: Config): Instance => {
  const subgraphClient: subgraph.SubgraphClient = subgraph.createClient(
    config.subgraphUri
  );

  const apiClient: api.ApiClient = api.createClient(config.apiUri);

  const instance: Instance = {
    listSales: (tokenId: string) =>
      subgraphClient.listSales(config.tokenContract, tokenId),
    listAllSales: () => subgraphClient.listAllSales(config.tokenContract),
    listBids: (tokenIds: string[]) =>
      apiClient.listBidsForTokens(config.tokenContract, tokenIds),
    listBidsByAccount: (account: string) =>
      apiClient.listBidsByAccount(config.tokenContract, account),
    placeBid: async (
      params: NewBidParameters,
      signer: ethers.Signer,
      statusCallback?: PlaceBidStatusCallback
    ) =>
      actions.placeBid({
        bid: params,
        contract: config.tokenContract,
        bidder: await signer.getAddress(),
        encodeBid: apiClient.encodeBid,
        signMessage: signer.signMessage,
        submitBid: apiClient.submitBid,
        statusCallback,
      }),
    isZAuctionApprovedToTransferNft: async (
      account: string
    ): Promise<boolean> => {
      const nftContract = await getERC721Contract(
        config.web3Provider,
        config.tokenContract
      );

      const isApproved = await actions.isZAuctionApprovedNftTransfer(
        account,
        config.zAuctionAddress,
        nftContract
      );

      return isApproved;
    },
    getZAuctionSpendAllowance: async (
      account: string
    ): Promise<ethers.BigNumber> => {
      const erc20Token = await getZAuctionTradeToken(
        config.web3Provider,
        config.zAuctionAddress
      );

      const allowance = await actions.getZAuctionTradeTokenAllowance(
        account,
        config.zAuctionAddress,
        erc20Token
      );

      return allowance;
    },
    getTradeTokenAddress: async (): Promise<string> => {
      const erc20Token = await getZAuctionTradeToken(
        config.web3Provider,
        config.zAuctionAddress
      );

      return erc20Token.address;
    },
    approveZAuctionSpendTradeTokens: async (
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
      const erc20Token = await getZAuctionTradeToken(
        signer,
        config.zAuctionAddress
      );

      const tx = await erc20Token.approve(
        config.zAuctionAddress,
        ethers.constants.MaxUint256
      );

      return tx;
    },
    approveZAuctionTransferNft: async (
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
      const nftContract = await getERC721Contract(signer, config.tokenContract);

      const tx = await nftContract.setApprovalForAll(
        config.zAuctionAddress,
        true
      );

      return tx;
    },
    acceptBid: async (
      bid: Bid,
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
      const zAuction = await getZAuctionContract(
        signer,
        config.zAuctionAddress
      );

      const tx = await zAuction.acceptBid(
        bid.signedMessage,
        bid.auctionId,
        bid.bidder,
        bid.amount,
        bid.tokenId,
        0,
        bid.startBlock,
        bid.expireBlock
      );

      return tx;
    },

    buyNow: async (
      auctionId: string,
      amount: string,
      tokenId: string,
      startBlock: string,
      expireBlock: string): Promise<ethers.ContractTransaction> => {
      // TODO implement
    },

    setBuyNow: async (
      amount: string,
      tokenId: string): Promise<ethers.ContractTransaction> => {
        // TODO implement
    }
  };

  return instance;
};
