import { ethers} from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

import * as actions from "../src/actions";
import { Config, createInstance } from "../src";
import { Web3Provider } from "@ethersproject/providers";
import { makeApiCall } from "../src/api/actions/helpers";
import { Bid, BidDto } from "../src/api/types";
import { expect } from "chai";
import { timeStamp } from "console";

describe("SDK test", () => {
  const registrarAddress = "0xa4F6C921f914ff7972D7C55c15f015419326e0Ca";
  const zAuctionAddress = "0xb2416Aed6f5439Ffa0eCCAaa2b643f3D9828f86B";
  const zAuctionLegacyAddress = "0x376030f58c76ECC288a4fce8F88273905544bC07";
  const mainAccount = "0xaE3153c9F5883FD2E78031ca2716520748c521dB";
  const astroTestAccount = "0x35888AD3f1C0b39244Bb54746B96Ee84A5d97a53";

  const provider = new ethers.providers.JsonRpcProvider(
    process.env.INFURA_URL,
    4
  );
  it("Accepts both v1 and v2 bids through the SDK", async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.INFURA_URL,
      4
    );

    const pk = process.env.MAIN_PRIVATE_KEY;
    if (!pk) throw Error("no private key");

    const pk2 = process.env.ASTRO_PRIVATE_KEY;
    if (!pk2) throw Error("no seller private key");

    const pk3 = process.env.CPTD_PRIVATE_KEY;
    if(!pk3) throw Error("no sirree")

    const mainWallet = new ethers.Wallet(pk, provider);
    const astroWallet = new ethers.Wallet(pk2, provider);
    const cptdWallet = new ethers.Wallet(pk3, provider)

    const config: Config = {
      // not actually mainnet
      apiUri: "https://zauction-api-rinkeby.herokuapp.com/api",
      subgraphUri:
        "https://api.thegraph.com/subgraphs/name/zer0-os/zauction-rinkeby",
      zAuctionAddress: "0xb2416Aed6f5439Ffa0eCCAaa2b643f3D9828f86B",
      zAuctionLegacyAddress: "0x376030f58c76ECC288a4fce8F88273905544bC07",
      // tokenContract: "0x73124d6436a30C998628D980C9c2643aa2021944",
      tokenContract: "0xa4F6C921f914ff7972D7C55c15f015419326e0Ca", // will be changed to hub not single registrar?
      web3Provider: provider as Web3Provider,
    };

    // we should have a `/api/bid/accepted` that takes in a bid and moves it or deletes it so can't reuse
    const sdk = createInstance(config);
    const main = "0xaE3153c9F5883FD2E78031ca2716520748c521dB"
    const mainbids = await sdk.listBidsByAccount(main);
    const wilderPancakes = "0x6e35a7ecbf6b6368bb8d42ee9b3dcfc8404857635036e60196931d4458c07622"
    const buyNowSales = await sdk.listBuyNowSales(wilderPancakes)

    console.log(mainbids)
    const domainFromBrett = "0xada136a490b49f140280941197b1c56cdc9668ec9c8b515c8f00d116b9942c09"

    const wilderPancakesDomainId = "0x6e35a7ecbf6b6368bb8d42ee9b3dcfc8404857635036e60196931d4458c07622"
    const happyDogsYayDomain = "0xef19e4b21819162b1083f981cf7330e784b8cd98b0a603bd5dd02e1fc5bc7fc4"
    // Confirm
    const bids: Bid[] = await sdk.listBidsByAccount(mainAccount);
    console.log(bids.length);

    const bidsNfts = await sdk.listBids([domainFromBrett])

    const singleBids: Bid[] = bids.filter(bid => bid.bidNonce === "22162161372");
    const bidToAccept = singleBids[0];

    // Must call the first time, make sure both the seller and the buyer are approved
    // const tx0 = await sdk.approveZAuctionSpendTradeTokensByBid(bidToAccept, cptdWallet);
    // const receipt0 = await tx0.wait(1);
    // const tx1 = await sdk.approveZAuctionTransferNftByBid(bidToAccept, cptdWallet);
    // const receipt1 = await tx1.wait(1);
    // const tx2 = await sdk.approveZAuctionSpendTradeTokensByBid(bidToAccept, mainWallet);
    // const receipt2 = await tx2.wait(1);
    // const tx3 = await sdk.approveZAuctionTransferNftByBid(bidToAccept, mainWallet);
    // const receipt3 = await tx3.wait(1);

    // const tx4 = await sdk.approveZAuctionSpendTradeTokensByBid(bidToAccept, astroWallet);
    // const receipt4 = await tx2.wait(1);
    // const tx5 = await sdk.approveZAuctionTransferNftByBid(bidToAccept, astroWallet);
    // const receipt5 = await tx3.wait(1);

    // Signer in this case is the seller of the domain
    // const tx = await sdk.acceptBid(bidToAccept, mainWallet);
  // const tx = await sdk.acceptBid(bidToAccept, mainWallet);
  // if(!tx) throw Error("void")
  // const receipt = await tx.wait(1);
  // console.log(receipt);
  });
});
