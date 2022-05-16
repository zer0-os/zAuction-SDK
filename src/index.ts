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
  BuyNowListing,
  TokenSale,
  TokenBuy,
  TokenSaleCollection,
  TokenBidCollection,
} from "./types";
import {
  getERC721Contract,
  getZAuctionContract,
  getZnsHubContract,
} from "./contracts";
import { IZNSHub } from "./contracts/types";
import { approveDomainTransfer, approveSpender } from "./actions";

export * from "./types";

export const createInstance = (config: Config): Instance => {
  const subgraphClient: subgraph.SubgraphClient = subgraph.createClient(
    config.subgraphUri
  );

  const apiClient: api.ApiClient = api.createClient(config.apiUri);

  const instance = {
    listSales: async (tokenId: string): Promise<TokenSale[]> => {
      const hub = await getZnsHubContract(
        config.web3Provider,
        config.znsHubAddress
      );
      const domainContract = await hub.getRegistrarForDomain(tokenId);
      const tokenSales: TokenSale[] = await subgraphClient.listSales(
        domainContract,
        tokenId
      );
      return tokenSales;
    },
    listAllSales: async (): Promise<TokenSaleCollection> => {
      const tokenSaleCollection: TokenSaleCollection =
        await subgraphClient.listAllSales();
      return tokenSaleCollection;
    },
    listBuyNowSales: async (tokenId: string): Promise<TokenBuy[]> => {
      const hub = await getZnsHubContract(
        config.web3Provider,
        config.znsHubAddress
      );
      const domainContract = await hub.getRegistrarForDomain(tokenId);
      const tokenBuys: TokenBuy[] = await subgraphClient.listBuyNowSales(
        domainContract,
        tokenId
      );
      return tokenBuys;
    },
    listBids: async (tokenIds: string[]): Promise<TokenBidCollection> => {
      const tokenBidCollection: TokenBidCollection =
        await apiClient.listBidsForTokens(tokenIds);
      return tokenBidCollection;
    },
    listBidsByAccount: async (account: string) => {
      const bidsList: Bid[] = await apiClient.listBidsByAccount(account);
      return bidsList;
    },
    placeBid: async (
      params: NewBidParameters,
      signer: ethers.Signer,
      statusCallback?: PlaceBidStatusCallback
    ) => {
      await actions.placeBid({
        bid: params,
        config: config,
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
        bid.contract
      );

      const isApproved = await actions.isZAuctionApprovedNftTransfer(
        account,
        zAuctionAddress,
        nftContract
      );

      return isApproved;
    },

    isZAuctionApprovedToTransferNftByDomain: async (
      account: string,
      tokenId: string
    ): Promise<boolean> => {
      const hub = await getZnsHubContract(
        config.web3Provider,
        config.znsHubAddress
      );
      const domainContract = await hub.getRegistrarForDomain(tokenId);
      const nftContract = await getERC721Contract(
        config.web3Provider,
        domainContract
      );

      const isApproved = await actions.isZAuctionApprovedNftTransfer(
        account,
        config.zAuctionAddress,
        nftContract
      );

      return isApproved;
    },
    isZAuctionLegacyApprovedToTransferNft: async (
      account: string,
      tokenId: string
    ): Promise<boolean> => {
      const hub = await getZnsHubContract(
        config.web3Provider,
        config.znsHubAddress
      );
      const domainContract = await hub.getRegistrarForDomain(tokenId);
      const nftContract = await getERC721Contract(
        config.web3Provider,
        domainContract
      );

      const isApproved = await actions.isZAuctionApprovedNftTransfer(
        account,
        config.zAuctionLegacyAddress,
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

      const bidToken = bid.bidToken ?? config.wildTokenAddress;

      const allowance = await actions.getPaymentTokenAllowance(
        account,
        bidToken,
        config.web3Provider,
        zAuctionAddress
      );

      return allowance;
    },
    getZAuctionSpendAllowanceByDomain: async (
      account: string,
      tokenId: string
    ): Promise<ethers.BigNumber> => {
      const contract = await getZAuctionContract(
        config.web3Provider,
        config.zAuctionAddress
      );
      const paymentToken = await contract.getPaymentTokenForDomain(tokenId);

      const allowance = await actions.getPaymentTokenAllowance(
        account,
        paymentToken,
        config.web3Provider,
        config.zAuctionAddress
      );
      return allowance;
    },
    getZAuctionSpendAllowance: async (
      paymentTokenAddress: string,
      account: string
    ): Promise<ethers.BigNumber> => {
      const allowance = await actions.getPaymentTokenAllowance(
        account,
        paymentTokenAddress,
        config.web3Provider,
        config.zAuctionAddress
      );

      return allowance;
    },
    getZAuctionLegacySpendAllowance: async (
      account: string
    ): Promise<ethers.BigNumber> => {
      const allowance = await actions.getPaymentTokenAllowance(
        account,
        config.wildTokenAddress,
        config.web3Provider,
        config.zAuctionAddress
      );

      return allowance;
    },
    // Set the ERC20 token for a specific domain network
    setNetworkPaymentToken: async (
      networkId: string,
      paymentToken: string,
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
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
      return tx;
    },
    // Return the ERC20 token used for payment in the network that domain is a part of.
    // This could be either the network payment token or the default payment token
    getPaymentTokenForDomain: async (tokenId: string): Promise<string> => {
      const contract = await getZAuctionContract(
        config.web3Provider,
        config.zAuctionAddress
      );
      const paymentToken = await contract.getPaymentTokenForDomain(tokenId);
      return paymentToken;
    },
    approveZAuctionSpendPaymentTokenByBid: async (
      bid: Bid,
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
      const isVersion1 = bid.version === "1.0";

      // route to legacy if version 1.0
      const zAuctionAddress = isVersion1
        ? config.zAuctionLegacyAddress
        : config.zAuctionAddress;

      const bidToken = bid.bidToken ?? config.wildTokenAddress;
      const tx = await actions.approveSpender(
        bidToken,
        zAuctionAddress,
        signer
      );
      return tx;
    },
    approveZAuctionSpendPaymentTokenByDomain: async (
      tokenId: string,
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
      const contract = await getZAuctionContract(
        config.web3Provider,
        config.zAuctionAddress
      );
      const paymentToken = await contract.getPaymentTokenForDomain(tokenId);
      const tx = await approveSpender(
        paymentToken,
        config.zAuctionAddress,
        signer
      );
      return tx;
    },
    approveZAuctionSpendPaymentToken: async (
      paymentTokenAddress: string,
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
      const tx = await approveSpender(
        paymentTokenAddress,
        config.zAuctionAddress,
        signer
      );
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

      const hub: IZNSHub = await getZnsHubContract(
        signer,
        config.znsHubAddress
      );
      const domainContract = await hub.getRegistrarForDomain(bid.tokenId);

      const tx = await approveDomainTransfer(
        domainContract,
        zAuctionAddress,
        signer
      );

      return tx;
    },
    approveZAuctionTransferNftByDomain: async (
      tokenId: string,
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
      const hub: IZNSHub = await getZnsHubContract(
        signer,
        config.znsHubAddress
      );
      const domainContract = await hub.getRegistrarForDomain(tokenId);

      const tx = approveDomainTransfer(
        domainContract,
        config.zAuctionAddress,
        signer
      );
      return tx;
    },
    acceptBid: async (
      bid: Bid,
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
      const tx = await actions.acceptBid(bid, signer, config);
      return tx;
    },
    cancelBid: async (
      bid: Bid,
      cancelOnChain: boolean,
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction | void> => {
      const isVersion1 = bid.version === "1.0";

      // route to legacy if version 1.0
      const zAuctionAddress = isVersion1
        ? config.zAuctionLegacyAddress
        : config.zAuctionAddress;

      const tx: ethers.ContractTransaction | void = await actions.cancelBid(
        bid,
        cancelOnChain,
        apiClient,
        zAuctionAddress,
        signer
      );
      return tx;
    },
    buyNow: async (
      params: BuyNowParams,
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
      const tx = await actions.buyNow(params, signer, config);
      return tx;
    },

    // IF no return value then that domain is not on sale
    getBuyNowPrice: async (tokenId: string): Promise<BuyNowListing> => {
      if (!tokenId) throw Error("Must provide a valid tokenId");

      let contract = await getZAuctionContract(
        config.web3Provider,
        config.zAuctionAddress
      );
      // getBuyNowPrice returns the listing because we also
      // want to be able to confirm the holder is the domain owner
      // in the zNS-SDK downstream
      const listing: BuyNowListing = await contract.priceInfo(tokenId);

      if (listing.price.eq("0")) {
        contract = await getZAuctionContract(
          config.web3Provider,
          config.zAuctionLegacyAddress
        );

        const listing: BuyNowListing = await contract.priceInfo(tokenId);
        return listing;
      }
      return listing;
    },
    setBuyNowPrice: async (
      params: BuyNowParams,
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
      const hub: IZNSHub = await getZnsHubContract(
        signer,
        config.znsHubAddress
      );
      const domainContract = await hub.getRegistrarForDomain(params.tokenId);

      const nftContract = await getERC721Contract(signer, domainContract);

      const owner = await nftContract.ownerOf(params.tokenId);
      const givenSeller = await signer.getAddress();

      if (givenSeller !== owner) {
        throw Error("Cannot set the price of a domain that is not yours");
      }

      // Seller must have approved zAuction to transfer their NFT(s)
      // before being able to set a buy price
      const isApproved = await actions.isZAuctionApprovedNftTransfer(
        owner,
        config.zAuctionAddress,
        nftContract
      );

      if (!isApproved) {
        throw Error("Seller did not approve zAuction to transfer NFT");
      }

      const contract = await getZAuctionContract(
        signer,
        config.zAuctionAddress
      );

      const listing = await contract.priceInfo(params.tokenId);

      if (listing.price.eq(params.amount)) {
        throw Error(
          "Unable to set price if a listing with that price already exists"
        );
      }

      const tx = await contract
        .connect(signer)
        .setBuyPrice(params.amount, params.tokenId);
      return tx;
    },

    cancelBuyNow: async (
      tokenId: string,
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
      const contract = await getZAuctionContract(
        signer,
        config.zAuctionAddress
      );

      const hub: IZNSHub = await getZnsHubContract(
        config.web3Provider,
        config.znsHubAddress
      );
      const domainContract = await hub.getRegistrarForDomain(tokenId);

      const nftContract = await getERC721Contract(
        config.web3Provider,
        domainContract
      );

      const seller = await nftContract.ownerOf(tokenId);
      const signerAddress = await signer.getAddress();

      if (signerAddress !== seller)
        throw Error("Cannot cancel buy now of a domain that is not yours");

      const tx = await contract
        .connect(signer)
        .setBuyPrice(ethers.BigNumber.from("0"), tokenId);
      return tx;
    },
  };

  return instance;
};
