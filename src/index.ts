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
  TokenSale,
  TokenBuy,
  TokenSaleCollection,
  TokenBidCollection,
} from "./types";
import {
  getERC20Contract,
  getERC721Contract,
  getZAuctionContract,
  getZnsHub,
} from "./contracts";
import { IZNSHub, ZAuction } from "./contracts/types";
import { approveDomainTransfer, approveSpender } from "./actions";
import { Maybe } from "./utilities";

export * from "./types";

export const createInstance = (config: Config): Instance => {
  const subgraphClient: subgraph.SubgraphClient = subgraph.createClient(
    config.subgraphUri
  );

  const apiClient: api.ApiClient = api.createClient(config.apiUri);

  const instance = {
    listSales: async (tokenId: string): Promise<TokenSale[]> => {
      const hub = await getZnsHub(config.web3Provider, config.znsHubAddress);
      const registrar = await hub.getRegistrarForDomain(tokenId);
      const tokenSales: TokenSale[] = await subgraphClient.listSales(
        registrar,
        tokenId
      );
      return tokenSales;
    },
    listAllSales: async (networkId: string): Promise<TokenSaleCollection> => {
      const tokenSaleCollection: TokenSaleCollection =
        await subgraphClient.listAllSales(networkId);
      return tokenSaleCollection;
    },
    listBuyNowSales: async (tokenId: string): Promise<TokenBuy[]> => {
      const hub = await getZnsHub(config.web3Provider, config.znsHubAddress);
      const registrar = await hub.getRegistrarForDomain(tokenId);
      const tokenBuys: TokenBuy[] = await subgraphClient.listBuyNowSales(
        registrar,
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
      const hub = await getZnsHub(config.web3Provider, config.znsHubAddress);
      const registrar = await hub.getRegistrarForDomain(params.tokenId);
      await actions.placeBid({
        bid: params,
        contract: registrar,
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

    isZAuctionApprovedToTransferNft: async (
      account: string,
      contractAddress: string
    ): Promise<boolean> => {
      const nftContract = await getERC721Contract(
        config.web3Provider,
        contractAddress
      );

      const isApproved = await actions.isZAuctionApprovedNftTransfer(
        account,
        config.zAuctionAddress,
        nftContract
      );

      return isApproved;
    },
    isZAuctionApprovedToTransferNftLegacy: async (
      account: string,
      contractAddress: string
    ): Promise<boolean> => {
      const nftContract = await getERC721Contract(
        config.web3Provider,
        contractAddress
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
    getZAuctionSpendAllowanceLegacy: async (
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
    // Return the default ERC20 token specified by zAuction
    getDefaultPaymentToken: async (): Promise<string> => {
      const contract = await getZAuctionContract(
        config.web3Provider,
        config.zAuctionAddress
      );
      const defaultToken = await contract.defaultPaymentToken();
      return defaultToken;
    },
    // Set the default ERC20 token for zAuction to use
    setDefaultPaymentToken: async (
      defaultTokenAddress: string,
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
      const contract = await getZAuctionContract(
        config.web3Provider,
        config.zAuctionAddress
      );

      const zAuctionOwner = await contract.owner();
      const signerAddress = await signer.getAddress();

      if (signerAddress !== zAuctionOwner) {
        throw Error(
          "Cannot set the default token for zAuction if you are not the owner"
        );
      }

      const tx = await contract
        .connect(signer)
        .setDefaultPaymentToken(defaultTokenAddress);
      return tx;
    },
    // Return the ERC20 token specified as the payment token for a network.
    // If not set, or is intentionally 0, it will return the default token
    getDomainNetworkPaymentToken: async (
      networkId: string
    ): Promise<string> => {
      const contract = await getZAuctionContract(
        config.web3Provider,
        config.zAuctionAddress
      );
      const networkToken = await contract.networkPaymentToken(networkId);
      return networkToken;
    },
    // Set the ERC20 token for a specific domain network
    setDomainNetworkPaymentToken: async (
      networkId: string,
      domainNetworkToken: string,
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
      const contract = await getZAuctionContract(
        config.web3Provider,
        config.zAuctionAddress
      );

      const zAuctionOwner = await contract.owner();
      const signerAddress = await signer.getAddress();

      if (signerAddress !== zAuctionOwner) {
        throw Error(
          "Cannot set a network's token for zAuction if you are not the owner"
        );
      }

      const tx = await contract
        .connect(signer)
        .setNetworkToken(networkId, domainNetworkToken);
      return tx;
    },
    // Return the ERC20 token used for payment in the network that domain is a part of.
    // This could be either the network payment token or the default payment token
    getPaymentTokenForDomain: async (
      domainTokenId: string
    ): Promise<string> => {
      const contract = await getZAuctionContract(
        config.web3Provider,
        config.zAuctionAddress
      );
      const paymentToken = await contract.getPaymentTokenForDomain(
        domainTokenId
      );
      return paymentToken;
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

      const bidToken = bid.bidToken ?? config.wildTokenAddress;
      const tx = await actions.approveSpender(
        bidToken,
        zAuctionAddress,
        signer
      );
      return tx;
    },
    approveZAuctionSpendTradeTokens: async (
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
    // do we need this actually?
    // accepting a legacy bid, does that require approval on sellers part? or just bidder?
    approveZAuctionSpendTradeTokensLegacy: async (
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
      const tx = await approveSpender(
        config.wildTokenAddress,
        config.zAuctionLegacyAddress,
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

      const hub = await getZnsHub(signer, config.znsHubAddress);
      const domainContractAddress = await hub.getRegistrarForDomain(
        bid.tokenId
      );

      const tx = await approveDomainTransfer(
        domainContractAddress,
        zAuctionAddress,
        signer
      );

      return tx;
    },
    approveZAuctionTransferNft: async (
      domainContractAddress: string,
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
      const tx = approveDomainTransfer(
        domainContractAddress,
        config.zAuctionAddress,
        signer
      );
      return tx;
    },
    approveZAuctionTransferNftLegacy: async (
      domainContractAddress: string,
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
      const tx = approveDomainTransfer(
        domainContractAddress,
        config.zAuctionLegacyAddress,
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
    getBuyNowPrice: async (tokenId: string): Promise<Listing> => {
      if (!tokenId) throw Error("Must provide a valid tokenId");

      let zAuction = await getZAuctionContract(
        config.web3Provider,
        config.zAuctionAddress
      );
      // getBuyNowPrice returns the listing because we also
      // want to be able to confirm the holder is the domain owner
      // in the zNS-SDK downstream
      const listing: Listing = await zAuction.priceInfo(tokenId);

      if (listing.price.eq("0")) {
        zAuction = await getZAuctionContract(
          config.web3Provider,
          config.zAuctionLegacyAddress
        );

        const listing: Listing = await zAuction.priceInfo(tokenId);
        return listing;
      }
      return listing;
    },
    setBuyNowPrice: async (
      params: BuyNowParams,
      signer: ethers.Signer
    ): Promise<ethers.ContractTransaction> => {
      const hub: IZNSHub = await getZnsHub(signer, config.znsHubAddress);
      const domainContract = await hub.getRegistrarForDomain(params.tokenId);

      const nftContract = await getERC721Contract(signer, domainContract);

      const seller = await nftContract.ownerOf(params.tokenId);
      const givenSeller = await signer.getAddress();

      if (givenSeller !== seller) {
        throw Error("Cannot set the price of a domain that is not yours");
      }

      // Seller must have approved zAuction to transfer their NFT(s)
      // before being able to set a buy price
      const isApproved = await actions.isZAuctionApprovedNftTransfer(
        seller,
        config.zAuctionAddress,
        nftContract
      );

      if (!isApproved) {
        throw Error("Seller did not approve zAuction to transfer NFT");
      }

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

      const hubAddress = await zAuction.hub();
      const hub: IZNSHub = await getZnsHub(config.web3Provider, hubAddress);
      const registrar = await hub.getRegistrarForDomain(tokenId);

      const nftContract = await getERC721Contract(
        config.web3Provider,
        registrar
      );

      const seller = await nftContract.ownerOf(tokenId);
      const signerAddress = await signer.getAddress();

      if (signerAddress !== seller)
        throw Error("Cannot cancel buy now of a domain that is not yours");

      const tx = await zAuction
        .connect(signer)
        .setBuyPrice(ethers.BigNumber.from("0"), tokenId);
      return tx;
    },
  };

  return instance;
};
