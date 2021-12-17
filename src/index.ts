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
  BuyNowParams,
} from "./types";
import {
  getERC721Contract,
  getZAuctionContract,
  getZAuctionTradeToken,
} from "./contracts";
import { ZAuction } from "./contracts/types";

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

    cancelBid: async (
      auctionId: string,
      signedBidMessage: string,
      cancelOnChain: boolean,
      signer: ethers.Signer
    ) => {
      // Always cancel the bid through the API
      const encodedCancelMessage = await apiClient.encodeCancelBid(signedBidMessage);
      const signedCancelMessage = await signer.signMessage(encodedCancelMessage);

      await apiClient.submitCancelBid(signedCancelMessage, signedBidMessage);

      // If enabled, also cancel the bid with the zAuction smart contract
      if (cancelOnChain) {
        const zAuction = await getZAuctionContract(
          signer,
          config.zAuctionAddress
        );

        const account = await signer.getAddress();

        await zAuction.cancelBid(account, auctionId);
      }
    },

    buyNow: async (
      params: BuyNowParams,
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
      const nftContract = await getERC721Contract(
        config.web3Provider,
        config.tokenContract
      );

      const seller = await nftContract.ownerOf(params.tokenId);

      const isApproved = await actions.isZAuctionApprovedNftTransfer(
        seller,
        config.zAuctionAddress,
        nftContract
      );

      if (!isApproved)
        throw Error("Seller did not approve zAuction to transfer NFT");

      const buyer = await signer.getAddress();

      const erc20Token = await getZAuctionTradeToken(
        config.web3Provider,
        config.zAuctionAddress
      );

      const allowance = await actions.getZAuctionTradeTokenAllowance(
        buyer,
        config.zAuctionAddress,
        erc20Token
      );

      // Ensure buyer has approved zAuction to transfer tokens on their behalf
      if (allowance < ethers.BigNumber.from(params.amount))
        throw Error("zAuction is not approved to transfer this many tokens");

      const zAuction = await getZAuctionContract(
        signer,
        config.zAuctionAddress
      );

      const tx = await zAuction.buyNow(params.amount, params.tokenId);

      return tx;
    },

    // IF no return value then that domain is not on sale
    getBuyNowPrice: async (
      tokenId: string,
      signer: ethers.Signer
    ): Promise<any> => {
      const zAuction = await getZAuctionContract(
        signer,
        config.zAuctionAddress
      )

      const listing = await zAuction.priceInfo(tokenId);
      return listing.price;
    },
    setBuyNowPrice: async (
      params: BuyNowParams,
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
      const nftContract = await getERC721Contract(
        config.web3Provider,
        config.tokenContract
      );

      const seller = await nftContract.ownerOf(params.tokenId);
      const givenSeller = await signer.getAddress();

      if (givenSeller !== seller)
        throw Error("Cannot set the price of a domain that is not yours");

      // Seller must have approved zAuction to transfer their NFT(s)
      // before being able to set a buy price
      const isApproved = await actions.isZAuctionApprovedNftTransfer(
        seller,
        config.zAuctionAddress,
        nftContract
      );

      if (!isApproved)
        throw Error("Seller did not approve zAuction to transfer NFT");

      const zAuction = await getZAuctionContract(
        signer,
        config.zAuctionAddress
      );

      const tx = await zAuction.setBuyPrice(params.amount, params.tokenId);
      return tx;
    },

    cancelBuyNow: async (
      tokenId: string,
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
      const zAuction = await getZAuctionContract(
        signer,
        config.zAuctionAddress
      );

      const nftContract = await getERC721Contract(
        config.web3Provider,
        config.tokenContract
      );

      const seller = await nftContract.ownerOf(tokenId);
      const givenSeller = await signer.getAddress();

      if (givenSeller !== seller)
        throw Error(
          "Cannot cancel the buy now price of a domain that is not yours"
        );

      const tx = await zAuction.setBuyPrice(ethers.BigNumber.from("0"), tokenId);
      return tx;
    },
  };

  return instance;
};
