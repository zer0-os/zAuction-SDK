import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { Web3Provider } from "@ethersproject/providers";
import { expect, use } from "chai";
import { getLogger, Maybe } from "../src/utilities";
import * as chaiAsPromised from "chai-as-promised";

use(chaiAsPromised.default);

const logger = getLogger("tests");

dotenv.config();

import {
  BuyNowListing,
  BuyNowParams,
  Config,
  createInstance,
  NewBidParameters,
  TokenBidCollection,
  TokenBidFilter,
  TokenBuy,
  TokenBuyNowListingCollection,
  TokenSale,
  TokenSaleCollection,
} from "../src";

import { Bid } from "../src/api/types";
import { getZAuctionContract } from "../src/contracts";
import { assert } from "console";

describe("SDK test", () => {
  const registrarAddress = "0xa4F6C921f914ff7972D7C55c15f015419326e0Ca";
  const zAuctionAddress = "0xb2416Aed6f5439Ffa0eCCAaa2b643f3D9828f86B";
  const zAuctionLegacyAddress = "0x376030f58c76ECC288a4fce8F88273905544bC07";

  const wilderPancakesDomain =
    "0x6e35a7ecbf6b6368bb8d42ee9b3dcfc8404857635036e60196931d4458c07622";
  const happyDogsYayDomain =
    "0xef19e4b21819162b1083f981cf7330e784b8cd98b0a603bd5dd02e1fc5bc7fc4";
  const wilderCatsDomain =
    "0x617b3c878abfceb89eb62b7a24f393569c822946bbc9175c6c65a7d2647c5402";

  const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);

  const pk = process.env.MAIN_PRIVATE_KEY;
  if (!pk) throw Error("no private key");

  const pk2 = process.env.ASTRO_PRIVATE_KEY;
  if (!pk2) throw Error("no seller private key");

  const pk3 = process.env.CPTD_PRIVATE_KEY;
  if (!pk3) throw Error("no sirree");

  const mainWallet = new ethers.Wallet(pk, provider);
  const astroWallet = new ethers.Wallet(pk2, provider);
  const cptdWallet = new ethers.Wallet(pk3, provider);

  const mainAccount = "0xaE3153c9F5883FD2E78031ca2716520748c521dB";
  const astroTestAccount = "0x35888AD3f1C0b39244Bb54746B96Ee84A5d97a53";
  const cptdAccount = "0x7829Afa127494Ca8b4ceEF4fb81B78fEE9d0e471";

  const config: Config = {
    // Rinkeby addresses
    apiUri: "https://zauction-api-rinkeby.herokuapp.com/api",
    subgraphUri:
      "https://api.thegraph.com/subgraphs/name/zer0-os/zauction-rinkeby",
    zAuctionAddress: "0xb2416Aed6f5439Ffa0eCCAaa2b643f3D9828f86B",
    zAuctionLegacyAddress: "0x376030f58c76ECC288a4fce8F88273905544bC07",
    wildTokenAddress: "0x3Ae5d499cfb8FB645708CC6DA599C90e64b33A79",
    znsHubAddress: "0x90098737eB7C3e73854daF1Da20dFf90d521929a",
    web3Provider: provider as Web3Provider,
  };
  const sdk = createInstance(config);
  let astroBidsArrayLength: number;
  it("Logger works", async () => {
    logger.log("Hello world");
    assert(logger);
  });
  it("Checks allowance by paymentTokenAddress", async () => {
    const allowance = await sdk.getZAuctionSpendAllowance(
      astroTestAccount,
      config.wildTokenAddress
    );
    expect(allowance).to.not.eq(ethers.BigNumber.from("0"));
  });
  it("Checks allowance through tokenId", async () => {
    const allowance = await sdk.getZAuctionSpendAllowanceByDomain(
      astroTestAccount,
      wilderPancakesDomain
    );
    expect(allowance).to.not.eq(ethers.BigNumber.from("0"));
  });
  it("Checks allowance by bid ", async () => {
    const bid = {
      bidToken: config.wildTokenAddress,
    } as Bid;
    const allowance = await sdk.getZAuctionSpendAllowanceByBid(
      astroTestAccount,
      bid
    );
    expect(allowance).to.not.eq(ethers.BigNumber.from("0"));
  });
  it("Lists sales for a specific domain", async () => {
    const sales: TokenSale[] = await sdk.listSales(wilderPancakesDomain);
  });
  it("Lists all sales", async () => {
    const sales: TokenSaleCollection = await sdk.listAllSales();
  });
  it("Lists all buyNow listings", async () => {
    const listings: TokenBuyNowListingCollection =
      await sdk.listAllBuyNowListings();
  });
  it("Lists bids and with filter as 'cancelled'", async () => {
    const filter: TokenBidFilter = TokenBidFilter.Cancelled;
    const bids: TokenBidCollection = await sdk.listBids(
      [wilderPancakesDomain],
      filter
    );
  });
  it("Lists bids and with filter as 'active'", async () => {
    const filter: TokenBidFilter = TokenBidFilter.Active;
    const bids: TokenBidCollection = await sdk.listBids(
      [wilderPancakesDomain],
      filter
    );
  });
  it("Lists bids and with filter as 'all'", async () => {
    const filter: TokenBidFilter = TokenBidFilter.All;
    const bids: TokenBidCollection = await sdk.listBids(
      [wilderPancakesDomain],
      filter
    );
  });
  it("Lists buyNow sales", async () => {
    const sales: TokenBuy[] = await sdk.listBuyNowSales(wilderPancakesDomain);
  });
  it("List bids through the API with no filter", async () => {
    const bids: TokenBidCollection = await sdk.listBids([wilderPancakesDomain]);
  });
  it("Lists bids by account", async () => {
    const bids: Bid[] = await sdk.listBidsByAccount(astroTestAccount);
    astroBidsArrayLength = bids.length;
  });
  it("Places a bid", async () => {
    const amount = ethers.utils.parseEther("0.0000001").toString();
    const params: NewBidParameters = {
      tokenId: wilderPancakesDomain,
      bidAmount: amount,
      startBlock: "0",
      expireBlock: "9999999999",
    };
    await sdk.placeBid(params, astroWallet);
    const bids = await sdk.listBidsByAccount(astroTestAccount);
    expect(bids.length).to.eq(astroBidsArrayLength + 1);
  });
  it("Recovers the correct address", async () => {
    const contract = await getZAuctionContract(
      config.web3Provider,
      config.zAuctionAddress
    );
    const params = {
      account: "0x35888AD3f1C0b39244Bb54746B96Ee84A5d97a53",
      bidNonce: "4120610753",
      bidAmount: "12000000000000000000",
      contractAddress: "0xa4f6c921f914ff7972d7c55c15f015419326e0ca",
      tokenId:
        "0x6e35a7ecbf6b6368bb8d42ee9b3dcfc8404857635036e60196931d4458c07622",
      minimumBid: "0",
      startBlock: "0",
      expireBlock: "9999999999",
      bidToken: "0x3Ae5d499cfb8FB645708CC6DA599C90e64b33A79",
      signedMessage:
        "0x76f2d057e7767ee77d906ff4e77acaf1d9b4679454810e40628d489a9ff2de4f6bfe8bed1d8b1b9c49e57199fc90467f22dfef7f89210802f6d1e79b82e941121c",
      date: "1652308171751",
      version: "2.0",
    };
    const data = await contract.createBidV2(
      params.bidNonce,
      params.bidAmount,
      params.tokenId,
      params.minimumBid,
      params.startBlock,
      params.expireBlock,
      config.wildTokenAddress
    );
    const arrayifiedData = await ethers.utils.arrayify(data);
    const unsignedMessage = await contract.toEthSignedMessageHash(
      arrayifiedData
    );
    const recoveredAccount = await contract.recover(
      unsignedMessage,
      params.signedMessage
    );
    expect(recoveredAccount).to.eq(params.account);
  });
  it("Accepts a v2.1 bid", async () => {
    const params = {
      bidder: "0x35888AD3f1C0b39244Bb54746B96Ee84A5d97a53",
      bidNonce: "4120610753",
      amount: "12000000000000000000",
      contract: "0xa4f6c921f914ff7972d7c55c15f015419326e0ca",
      tokenId:
        "0x6e35a7ecbf6b6368bb8d42ee9b3dcfc8404857635036e60196931d4458c07622",
      startBlock: "0",
      expireBlock: "9999999999",
      bidToken: "0x3Ae5d499cfb8FB645708CC6DA599C90e64b33A79",
      signedMessage:
        "0x76f2d057e7767ee77d906ff4e77acaf1d9b4679454810e40628d489a9ff2de4f6bfe8bed1d8b1b9c49e57199fc90467f22dfef7f89210802f6d1e79b82e941121c",
      timestamp: "1652308171751",
      version: "2.0",
    } as Bid;
    // Successful hash
    // 0xe168848eea33e7317c8ff20dd0f938aaa921982c561e1fd271746f222b9391e8
    // const tx = await sdk.acceptBid(params, mainWallet);
    // console.log(tx.hash);
    // const receipt = await tx.wait(1);
    // console.log(receipt);
  });
  it("Accepts a v2.0 bid", async () => {
    const params = {
      bidder: "0xaE3153c9F5883FD2E78031ca2716520748c521dB",
      bidNonce: "23865561613",
      amount: "2000000000000000000",
      contract: "0xa4F6C921f914ff7972D7C55c15f015419326e0Ca",
      tokenId:
        "0x6e35a7ecbf6b6368bb8d42ee9b3dcfc8404857635036e60196931d4458c07622",
      startBlock: "0",
      expireBlock: "9999999999",
      bidToken: "",
      signedMessage:
        "0xe30293df13291c4bdd026857f8e96bdb2ed2124cb912152dc2c2a6630ee53b5b551956469d56cea877e02da3149513f4067d1f6c311dea38a7a9a37f4bdb6d261c",
      timestamp: "1652370554226",
      version: "2.0",
    } as Bid;

    // Successful tx hash
    // 0xc709aed1859b6f1af5bb8e677f4ab34ea7f8897790f3673eb16fbff3b5d5da2d
    //   const tx = await sdk.acceptBid(params, astroWallet);
    //   console.log(tx.hash);
    //   const receipt = await tx.wait(1);
    //   console.log(receipt);
  });
  it("Gets a buy now listed for a token that has been listed", async () => {
    const listing: Maybe<BuyNowListing> = await sdk.getBuyNowListing(
      wilderPancakesDomain
    );
    if (listing) {
      expect(listing.price.toString()).to.not.eq(ethers.constants.HashZero);
    }
  });
  it("Returns undefined when we try to get a buyNowListing for a domain where the owner has changed", async () => {
    const listing = await sdk.getBuyNowListing(wilderCatsDomain);
    expect(listing).to.be.eq(undefined);
  });
  it("Sets a buy now price", async () => {
    const paymentToken = await sdk.getPaymentTokenForDomain(
      wilderPancakesDomain
    );
    const params: BuyNowParams = {
      amount: ethers.utils.parseEther("0.02").toString(),
      tokenId: wilderPancakesDomain,
      paymentToken: paymentToken,
    };
    // Successful tx hash
    // 0x5106cc98a780b231486b8e98eca93ade17b02b316b6eca4bad820366e0476c70
    // const tx = await sdk.setBuyNowPrice(params, mainWallet);
    // console.log(tx.hash);
  });
});
