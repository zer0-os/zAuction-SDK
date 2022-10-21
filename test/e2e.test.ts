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
  // Goerli domains

  // 0://meow
  const meowDomain =
    "48675636713738164700523832260055511158906465948015792318462283941580532732750";
  // 0://wilder
  const wilderDomain =
    "11498710528894704621672125451994986004212771421624589370395108607834545240891";
  // 0://wilder.wheels
  const wilderWheelsDomain =
    "52590356589445487017169158517782960279836870126047062689286666951687798875167";

  const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);

  // Astro test account
  const pk = process.env.ASTRO_PRIVATE_KEY;
  if (!pk) throw Error("no private key");

  const wallet = new ethers.Wallet(pk, provider);
  let walletAddress: string;

  const config: Config = {
    // Goerli addresses
    // apiUri: "http://localhost:5000/api",
    apiUri: "https://zauction-api-goerli.herokuapp.com/api",
    subgraphUri:
      "https://api.thegraph.com/subgraphs/name/zer0-os/zauction-goerli",
    zAuctionAddress: "0x78764080e4Fb36CB24487d3Ca8e3aa92cD7C58fc",
    zAuctionLegacyAddress: "0xeABfD3B80A38a95006899Ddf7e8d5F89A5dE6dF3",
    wildTokenAddress: "0x0e46c45f8aca3f89Ad06F4a20E2BED1A12e4658C",
    znsHubAddress: "0xce1fE2DA169C313Eb00a2bad25103D2B9617b5e1",
    web3Provider: provider as Web3Provider,
  };
  const sdk = createInstance(config);

  before( async () => {
    walletAddress = await wallet.getAddress();
  });
  it("Logger works", async () => {
    logger.log("Hello world");
    assert(logger);
  });
  it("Checks allowance by paymentTokenAddress", async () => {
    const allowance = await sdk.getZAuctionSpendAllowance(
      walletAddress,
      config.wildTokenAddress
    );
    // Account is approved for Wild token
    expect(allowance.toString()).to.not.eq("0");
  });
  it("Checks allowance through tokenId", async () => {
    const allowance = await sdk.getZAuctionSpendAllowanceByDomain(
      walletAddress,
      meowDomain
    );
    // Account is not approved for the Zer0 token
    expect(allowance.toString()).to.eq("0");
  });
  it("Checks allowance by bid ", async () => {
    const bid = {
      bidToken: config.wildTokenAddress,
    } as Bid;
    const allowance = await sdk.getZAuctionSpendAllowanceByBid(
      walletAddress,
      bid
    );
    expect(allowance).to.not.eq(ethers.BigNumber.from("0"));
  });
  it("Lists sales for a specific domain", async () => {
    const sales: TokenSale[] = await sdk.listSales(meowDomain);
    expect(sales).to.be.empty; // for now
  });
  it("Lists all sales", async () => {
    const sales: TokenSaleCollection = await sdk.listAllSales();
    expect(sales).to.be.empty; // for now
  });
  it("Lists all buyNow listings", async () => {
    const listings: TokenBuyNowListingCollection =
      await sdk.listAllBuyNowListings();
    expect(listings).to.be.empty; // for now
  });
  it("Lists buyNow sales", async () => {
    const sales: TokenBuy[] = await sdk.listBuyNowSales(meowDomain);
    expect(sales).to.be.empty; // for now
  });
  it("Places a bid", async () => {
    const accountBids: Bid[] = await sdk.listBidsByAccount(walletAddress);
    const amount = ethers.utils.parseEther("0.0000001").toString();
    const params: NewBidParameters = {
      tokenId: wilderWheelsDomain,
      bidAmount: amount,
      startBlock: "0",
      expireBlock: "9999999999",
    };
    await sdk.placeBid(params, wallet);
    const bids = await sdk.listBidsByAccount(walletAddress);
    expect(bids.length).to.eq(accountBids.length + 1);
  });

  //
  // it("Lists bids and with filter as 'cancelled'", async () => {
  //   const filter: TokenBidFilter = TokenBidFilter.Cancelled;
  //   const bids: TokenBidCollection = await sdk.listBids(
  //     [meowDomain],
  //     filter
  //   );
  // });
  // it("Lists bids and with filter as 'active'", async () => {
  //   const filter: TokenBidFilter = TokenBidFilter.Active;
  //   const bids: TokenBidCollection = await sdk.listBids(
  //     [meowDomain],
  //     filter
  //   );
  // });
  // it("Lists bids and with filter as 'all'", async () => {
  //   const filter: TokenBidFilter = TokenBidFilter.All;
  //   const bids: TokenBidCollection = await sdk.listBids(
  //     [meowDomain],
  //     filter
  //   );
  // });
  // it("List bids through the API with no filter", async () => {
  //   const bids: TokenBidCollection = await sdk.listBids([meowDomain]);
  // });

  // it("Lists bids by account", async () => {
  //   const bids: Bid[] = await sdk.listBidsByAccount(astroTestAccount);
  //   astroBidsArrayLength = bids.length;
  // });
  
  // it("Recovers the correct address", async () => {
  //   const contract = await getZAuctionContract(
  //     config.web3Provider,
  //     config.zAuctionAddress
  //   );
  //   const params = {
  //     account: "0x35888AD3f1C0b39244Bb54746B96Ee84A5d97a53",
  //     bidNonce: "4120610753",
  //     bidAmount: "12000000000000000000",
  //     contractAddress: "0xa4f6c921f914ff7972d7c55c15f015419326e0ca",
  //     tokenId:
  //       "0x6e35a7ecbf6b6368bb8d42ee9b3dcfc8404857635036e60196931d4458c07622",
  //     minimumBid: "0",
  //     startBlock: "0",
  //     expireBlock: "9999999999",
  //     bidToken: "0x3Ae5d499cfb8FB645708CC6DA599C90e64b33A79",
  //     signedMessage:
  //       "0x76f2d057e7767ee77d906ff4e77acaf1d9b4679454810e40628d489a9ff2de4f6bfe8bed1d8b1b9c49e57199fc90467f22dfef7f89210802f6d1e79b82e941121c",
  //     date: "1652308171751",
  //     version: "2.0",
  //   };
  //   const data = await contract.createBidV2(
  //     params.bidNonce,
  //     params.bidAmount,
  //     params.tokenId,
  //     params.minimumBid,
  //     params.startBlock,
  //     params.expireBlock,
  //     config.wildTokenAddress
  //   );
  //   const arrayifiedData = await ethers.utils.arrayify(data);
  //   const unsignedMessage = await contract.toEthSignedMessageHash(
  //     arrayifiedData
  //   );
  //   const recoveredAccount = await contract.recover(
  //     unsignedMessage,
  //     params.signedMessage
  //   );
  //   expect(recoveredAccount).to.eq(params.account);
  // });
  // it("Accepts a v2.1 bid", async () => {
  //   const params = {
  //     bidder: "0x35888AD3f1C0b39244Bb54746B96Ee84A5d97a53",
  //     bidNonce: "4120610753",
  //     amount: "12000000000000000000",
  //     contract: "0xa4f6c921f914ff7972d7c55c15f015419326e0ca",
  //     tokenId:
  //       "0x6e35a7ecbf6b6368bb8d42ee9b3dcfc8404857635036e60196931d4458c07622",
  //     startBlock: "0",
  //     expireBlock: "9999999999",
  //     bidToken: "0x3Ae5d499cfb8FB645708CC6DA599C90e64b33A79",
  //     signedMessage:
  //       "0x76f2d057e7767ee77d906ff4e77acaf1d9b4679454810e40628d489a9ff2de4f6bfe8bed1d8b1b9c49e57199fc90467f22dfef7f89210802f6d1e79b82e941121c",
  //     timestamp: "1652308171751",
  //     version: "2.0",
  //   } as Bid;
  //   // Successful hash
  //   // 0xe168848eea33e7317c8ff20dd0f938aaa921982c561e1fd271746f222b9391e8
  //   // const tx = await sdk.acceptBid(params, mainWallet);
  //   // console.log(tx.hash);
  //   // const receipt = await tx.wait(1);
  //   // console.log(receipt);
  // });
  // it("Accepts a v2.0 bid", async () => {
  //   const params = {
  //     bidder: "0xaE3153c9F5883FD2E78031ca2716520748c521dB",
  //     bidNonce: "23865561613",
  //     amount: "2000000000000000000",
  //     contract: "0xa4F6C921f914ff7972D7C55c15f015419326e0Ca",
  //     tokenId:
  //       "0x6e35a7ecbf6b6368bb8d42ee9b3dcfc8404857635036e60196931d4458c07622",
  //     startBlock: "0",
  //     expireBlock: "9999999999",
  //     bidToken: "",
  //     signedMessage:
  //       "0xe30293df13291c4bdd026857f8e96bdb2ed2124cb912152dc2c2a6630ee53b5b551956469d56cea877e02da3149513f4067d1f6c311dea38a7a9a37f4bdb6d261c",
  //     timestamp: "1652370554226",
  //     version: "2.0",
  //   } as Bid;

  //   // Successful tx hash
  //   // 0xc709aed1859b6f1af5bb8e677f4ab34ea7f8897790f3673eb16fbff3b5d5da2d
  //   //   const tx = await sdk.acceptBid(params, astroWallet);
  //   //   console.log(tx.hash);
  //   //   const receipt = await tx.wait(1);
  //   //   console.log(receipt);
  // });
  // it("Gets a buy now listed for a token that has been listed", async () => {
  //   const listing: Maybe<BuyNowListing> = await sdk.getBuyNowListing(
  //     meowDomain
  //   );
  //   if (listing) {
  //     expect(listing.price.toString()).to.not.eq(ethers.constants.HashZero);
  //   }
  // });
  // it("Returns undefined when we try to get a buyNowListing for a domain where the owner has changed", async () => {
  //   const listing = await sdk.getBuyNowListing(wilderCatsDomain);
  //   expect(listing).to.be.eq(undefined);
  // });
  // it("Sets a buy now price", async () => {
  //   const paymentToken = await sdk.getPaymentTokenForDomain(
  //     meowDomain
  //   );
  //   const params: BuyNowParams = {
  //     amount: ethers.utils.parseEther("0.02").toString(),
  //     tokenId: meowDomain,
  //     paymentToken: paymentToken,
  //   };
  //   // Successful tx hash
  //   // 0x5106cc98a780b231486b8e98eca93ade17b02b316b6eca4bad820366e0476c70
  //   // const tx = await sdk.setBuyNowPrice(params, mainWallet);
  //   // console.log(tx.hash);
  // });
});
