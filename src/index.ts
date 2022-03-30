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
  Listing,
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

  const instance = {
    listSales: (tokenId: string) =>
      subgraphClient.listSales(config.tokenContract, tokenId),
    listAllSales: () => subgraphClient.listAllSales(config.tokenContract),
    listBids: (tokenIds: string[]) =>
      apiClient.listBidsForTokens(tokenIds),
    listBidsByAccount: (account: string) =>
      apiClient.listBidsByAccount(account),
    placeBid: async (
      params: NewBidParameters,
      signer: ethers.Signer,
      statusCallback?: PlaceBidStatusCallback
    ) => {
      let address;
      try {
        address = await signer;
      } catch (e) {
        throw Error("Cannot get address from this signer.");
      }

      await actions.placeBid({
        bid: params,
        contract: config.tokenContract,
        bidder: await signer.getAddress(),
        encodeBid: apiClient.encodeBid,
        signMessage: (e) => signer.signMessage(e),
        submitBid: apiClient.submitBid,
        statusCallback,
      });
    },

    isZAuctionApprovedToTransferNftByBid: async (
      account: string,
      bid: Bid
    ): Promise<boolean> => {
      const isVersion1 = bid.version === "1.0";

      // route to legacy if version 1.0
      const zAuctionAddress = isVersion1
        ? config.zAuctionLegacyAddress
        : config.zAuctionAddress;

      const nftContract = await getERC721Contract(
        config.web3Provider,
        config.tokenContract
      );

      const isApproved = await actions.isZAuctionApprovedNftTransfer(
        account,
        zAuctionAddress,
        nftContract
      );

      return isApproved;
    },

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
    getZAuctionSpendAllowanceByBid: async (
      account: string,
      bid: Bid
    ): Promise<ethers.BigNumber> => {
      const isVersion1 = bid.version === "1.0";

      // route to legacy if version 1.0
      const zAuctionAddress = isVersion1
        ? config.zAuctionLegacyAddress
        : config.zAuctionAddress;

      const erc20Token = await getZAuctionTradeToken(
        config.web3Provider,
        zAuctionAddress
      );

      const allowance = await actions.getZAuctionTradeTokenAllowance(
        account,
        zAuctionAddress,
        erc20Token
      );

      return allowance;
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

    approveZAuctionSpendTradeTokensByBid: async (
      bid: Bid,
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
      const isVersion1 = bid.version === "1.0";

      // route to legacy if version 1.0
      const zAuctionAddress = isVersion1
        ? config.zAuctionLegacyAddress
        : config.zAuctionAddress;

      const erc20Token = await getZAuctionTradeToken(signer, zAuctionAddress);

      const tx = await erc20Token
        .connect(signer)
        .approve(zAuctionAddress, ethers.constants.MaxUint256);

      return tx;
    },

    approveZAuctionSpendTradeTokens: async (
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
      const erc20Token = await getZAuctionTradeToken(
        signer,
        config.zAuctionAddress
      );

      const tx = await erc20Token
        .connect(signer)
        .approve(config.zAuctionAddress, ethers.constants.MaxUint256);

      return tx;
    },

    approveZAuctionTransferNftByBid: async (
      bid: Bid,
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
      const isVersion1 = bid.version === "1.0";

      // route to legacy if version 1.0
      const zAuctionAddress = isVersion1
        ? config.zAuctionLegacyAddress
        : config.zAuctionAddress;

      const nftContract = await getERC721Contract(signer, config.tokenContract);

      const tx = await nftContract
        .connect(signer)
        .setApprovalForAll(zAuctionAddress, true);

      return tx;
    },

    approveZAuctionTransferNft: async (
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
      const nftContract = await getERC721Contract(signer, config.tokenContract);

      const tx = await nftContract
        .connect(signer)
        .setApprovalForAll(config.zAuctionAddress, true);

      return tx;
    },

    acceptBid: async (
      bid: Bid,
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> =>
      actions.acceptBid(bid, signer, config),

    cancelBid: async (
      bidNonce: string,
      signedBidMessage: string,
      cancelOnChain: boolean,
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction | void> => {
      // Always cancel the bid through the API
      const encodedCancelMessage = await apiClient.encodeCancelBid(
        signedBidMessage
      );
      const signedCancelMessage = await signer.signMessage(
        encodedCancelMessage
      );

      await apiClient.submitCancelBid(signedCancelMessage, signedBidMessage);

      // If enabled, also cancel the bid with the zAuction smart contract
      if (cancelOnChain) {
        const zAuction = await getZAuctionContract(
          signer,
          config.zAuctionAddress
        );

        const account = await signer.getAddress();

        const tx = await zAuction.connect(signer).cancelBid(account, bidNonce);
        return tx;
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

      if (!isApproved) {
        throw Error("Seller did not approve zAuction to transfer NFT");
      }

      const buyer = await signer.getAddress();

      if (seller === buyer) {
        throw Error("Cannot sell a domain to yourself");
      }

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
      if (allowance.lt(ethers.BigNumber.from(params.amount))) {
        throw Error("zAuction is not approved to transfer this many tokens");
      }

      const zAuction = await getZAuctionContract(
        signer,
        config.zAuctionAddress
      );

      const price = (await zAuction.priceInfo(params.tokenId)).price;
      if (price.eq("0")) {
        throw Error("Domain is not for sale");
      }
      if (!price.eq(ethers.BigNumber.from(params.amount))) {
        throw Error("Incorrect buyNow price given");
      }

      const tx = await zAuction
        .connect(signer)
        .buyNow(ethers.BigNumber.from(params.amount), params.tokenId);

      return tx;
    },

    // IF no return value then that domain is not on sale
    getBuyNowPrice: async (tokenId: string): Promise<Listing> => {
      if (!tokenId) throw Error("Must provide a valid tokenId");

      const zAuction = await getZAuctionContract(
        config.web3Provider,
        config.zAuctionAddress
      );
      // getBuyNowPrice returns the listing because we also
      // want to be able to confirm the holder is the domain owner
      // in the zNS-SDK downstream
      const listing: Listing = await zAuction.priceInfo(tokenId);
      return listing;
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

      const tx = await zAuction
        .connect(signer)
        .setBuyPrice(params.amount, params.tokenId);
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

      const tx = await zAuction
        .connect(signer)
        .setBuyPrice(ethers.BigNumber.from("0"), tokenId);
      return tx;
    },
  };

  return instance;
};
