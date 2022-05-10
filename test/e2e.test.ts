import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

import { Config, createInstance } from "../src";
import { Web3Provider } from "@ethersproject/providers";
import { Bid } from "../src/api/types";
import { expect } from "chai";

describe("SDK test", () => {
  const registrarAddress = "0xa4F6C921f914ff7972D7C55c15f015419326e0Ca";
  const zAuctionAddress = "0xb2416Aed6f5439Ffa0eCCAaa2b643f3D9828f86B";
  const zAuctionLegacyAddress = "0x376030f58c76ECC288a4fce8F88273905544bC07";


  const wilderPancakesDomain =
      "0x6e35a7ecbf6b6368bb8d42ee9b3dcfc8404857635036e60196931d4458c07622";
  const wilderPancakesDomainId =
    "0x6e35a7ecbf6b6368bb8d42ee9b3dcfc8404857635036e60196931d4458c07622";
  const happyDogsYayDomain =
    "0xef19e4b21819162b1083f981cf7330e784b8cd98b0a603bd5dd02e1fc5bc7fc4";

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

  it("List bids and confirms we are connected", async () => {
    const bids: Bid[] = await sdk.listBidsByAccount(astroTestAccount);
    console.log(bids.length);
  });
  it("Accepts a legacy bid", async () => {
    const bids: Bid[] = await sdk.listBidsByAccount(mainAccount);

    // Successful tx hash
    // 0xeaeae63388aaffd4fbfff17606b0756463f5ef903ac8847a4bcf0d3b067d6a70
    const specificBid = bids.filter(bid => bid.bidNonce === "26179015888");
    expect(specificBid.length).to.eq(1);

    // const tx = await sdk.acceptBid(specificBid[0], astroWallet);
    // const receipt = await tx.wait(1);
    // console.log(receipt.transactionHash);
  });
  it("Accepts a v2 bid", async () => {
    const allBids: Bid[] = await sdk.listBidsByAccount(mainAccount);

    const bids = allBids.filter(bid => bid.bidNonce === "12970992062")
    // Successful tx hash
    // 0x492caa7181dacc33942d749e48f84e174f447999e59aaeae221a15f77519eb16

    // const tx = await sdk.acceptBid(bids[0], astroWallet);
    // const receipt = await tx.wait(1);
    // console.log(receipt.transactionHash);
  })
  it("Accepts a v2.1 bid", async () => {
    const bids: Bid[] = await sdk.listBidsByAccount(astroTestAccount);

    const v2dot1Bids: Bid[] = [];
    for(let bid of bids) {
      if(bid.bidToken) {
        v2dot1Bids.push(bid)
      }
    }

    // Successful tx hash
    // 0x5bb2d0353644a482ce7f7337c1380ed4b8dadb99f6a8164f2cd7560e15c7a03d

    // const tx = await sdk.acceptBid(v2dot1Bids[1], mainWallet);
    // const receipt = await tx.wait(1);
    // console.log(receipt.transactionHash);
  });
});
