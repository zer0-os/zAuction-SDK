import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { Web3Provider } from "@ethersproject/providers";
import { expect, use } from "chai";
import { getLogger } from "../src/utilities";
import * as chaiAsPromised from "chai-as-promised";

use(chaiAsPromised.default);

const logger = getLogger("tests");

dotenv.config();

import {
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
  it("Lists bids and with filter as 'cancelled'", async () => {
    const filter: TokenBidFilter = TokenBidFilter.Cancelled;
    const bids: TokenBidCollection = await sdk.listBids(
      [meowDomain],
      filter
    );
  });
  it("Lists bids and with filter as 'active'", async () => {
    const filter: TokenBidFilter = TokenBidFilter.Active;
    const bids: TokenBidCollection = await sdk.listBids(
      [meowDomain],
      filter
    );
  });
  it("Lists bids and with filter as 'all'", async () => {
    const filter: TokenBidFilter = TokenBidFilter.All;
    const bids: TokenBidCollection = await sdk.listBids(
      [meowDomain],
      filter
    );
  });
  it("List bids through the API with no filter", async () => {
    const bids: TokenBidCollection = await sdk.listBids([meowDomain]);
  });
  it("Returns undefined when we try to get a buyNowListing for a domain without a listing", async () => {
    const listing = await sdk.getBuyNowListing(wilderDomain);
    expect(listing).to.be.eq(undefined);
  });
});
