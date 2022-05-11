import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

import {
  BuyNowParams,
  Config,
  createInstance,
  NewBidParameters,
  TokenBidCollection,
  TokenBuy,
  TokenSale,
  TokenSaleCollection,
} from "../src";
import { Web3Provider } from "@ethersproject/providers";
import { Bid } from "../src/api/types";
import { expect } from "chai";
import {
  getZAuctionContract,
  getZAuctionV1Contract,
  getZnsHubContract,
} from "../src/contracts";

describe("SDK test", () => {
  const registrarAddress = "0xa4F6C921f914ff7972D7C55c15f015419326e0Ca";
  const zAuctionAddress = "0xb2416Aed6f5439Ffa0eCCAaa2b643f3D9828f86B";
  const zAuctionLegacyAddress = "0x376030f58c76ECC288a4fce8F88273905544bC07";

  const wilderPancakesDomain =
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
  let astroBidsArrayLength: number;

  it("Lists sales for a specific domain", async () => {
    const sales: TokenSale[] = await sdk.listSales(wilderPancakesDomain);
  });
  it("Lists all sales", async () => {
    const sales: TokenSaleCollection = await sdk.listAllSales(
      wilderPancakesDomain
    );
  });
  it("Lists bids and confirms we are connected", async () => {
    const bids: Bid[] = await sdk.listBidsByAccount(astroTestAccount);
    astroBidsArrayLength = bids.length;
  });
  it("Lists buyNow sales", async () => {
    const sales: TokenBuy[] = await sdk.listBuyNowSales(wilderPancakesDomain);
  });
  it("List bids through the API", async () => {
    const bids: TokenBidCollection = await sdk.listBids([wilderPancakesDomain]);
  });
  it("Lists bids by account", async () => {
    const bids: Bid[] = await sdk.listBidsByAccount(mainAccount);
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
  // Successful tx hash from first round
  // 0xeaeae63388aaffd4fbfff17606b0756463f5ef903ac8847a4bcf0d3b067d6a70
  it("Accepts a v1 bid with the contract directly", async () => {
    const contract = await getZAuctionV1Contract(
      config.web3Provider,
      config.zAuctionLegacyAddress
    );

    const contract2 = await getZAuctionContract(
      config.web3Provider,
      config.zAuctionAddress
    )

    const params = {
      signature:
        "0xeedd3bb6e03aab2651f759b4d36d2fb7ae4100b4ffd3ff7260d0e334913d682a3afb20f67097f280ac919a95ca6dc17c8c0674924f8cc70da86c03773033bb8b1b",
      bidNonce: "4701147026",
      bidder: astroTestAccount,
      bidAmount: "1370000000000000000",
      domaintokenId: wilderPancakesDomain,
      minbid: "0",
      startblock: "0",
      expireblock: "999999999999",
    };

    const data = await contract.createBid(
      params.bidNonce,
      params.bidAmount,
      registrarAddress,
      params.domaintokenId,
      params.minbid,
      params.startblock,
      params.expireblock
    );

    const ethHashdata = await contract.toEthSignedMessageHash(data);
    const recoveredAccount = await contract.recover(ethHashdata, params.signature);
    console.log(recoveredAccount);

    const data2 = await contract2.createBidV2(
      params.bidNonce,
      params.bidAmount,
      params.domaintokenId,
      params.minbid,
      params.startblock,
      params.expireblock,
      config.wildTokenAddress
    )
    
    const ethHashdata2 = await contract.toEthSignedMessageHash(data2);
    const recoveredAccount2 = await contract.recover(ethHashdata2, params.signature);
    console.log(recoveredAccount2);

    // const tx = await contract
    //   .connect(mainWallet)
    //   .acceptBid(
    //     params.signature,
    //     params.bidNonce,
    //     params.bidder,
    //     params.bidAmount,
    //     registrarAddress,
    //     params.domaintokenId,
    //     params.minbid,
    //     params.startblock,
    //     params.expireblock,
    //     {
    //       gasLimit: 1000000,
    //     }
    //   );
    // console.log(tx.hash);
  });
  it("Accepts a v2 bid with the contract directly", async () => {
    // Can't get v2 bids to work right, fails on "recovered incorrect bidder"
    const contract = await getZAuctionContract(
      config.web3Provider,
      config.zAuctionAddress
    );

    const params = {
      signature:
        "0x893c76db1ddbd812417d9ce3fb1ae2fd2fa5664c95e886cce984d71e10a3118c5b36bde7b8145eaf81f0b4ff04d33c9767d1535dcc017fc155f970d3662da2b71c",
      bidNonce: "2495145018",
      bidder: astroTestAccount,
      bidAmount: "3124560000000000000",
      domaintokenId: wilderPancakesDomain,
      minbid: "0",
      startblock: "0",
      expireblock: "999999999999",
    };

    // const tx = await contract
    //   .connect(mainWallet)
    //   .acceptBid(
    //     params.signature,
    //     params.bidNonce,
    //     params.bidder,
    //     params.bidAmount,
    //     params.domaintokenId,
    //     params.minbid,
    //     params.startblock,
    //     params.expireblock,
    //     {
    //       gasLimit: 1000000,
    //     }
    //   )
    //   console.log(tx.hash);
  });
  it("Accepts a v2.1 bid with the contract directly", async () => {
    const contract = await getZAuctionContract(
      config.web3Provider,
      config.zAuctionAddress
    );

    const params = {
      signature:
        "0x75ad60dfe869a2dccd86cef814d8edba3dfc524b21113f21e9bd70d9ab7fd891635b42c0837b8f2a2a4b0ebd1206e54973593c27077dc8571e134c20a8f9b3fc1b",
      bidNonce: "34747568340",
      bidder: astroTestAccount,
      bidAmount: "21212100000000000000",
      domaintokenId: wilderPancakesDomain, // owner of this domain is now astro
      minbid: "0",
      startblock: "0",
      expireblock: "99999999999",
    };
    // Successful tx hash
    // 0x3e4d7d0c9b90cd95c300fd5b1ce2239a6bfc2360870da0700c139a08bfdbeabf
    // const tx = await contract
    //   .connect(mainWallet)
    //   .acceptBidV2(
    //     params.signature,
    //     params.bidNonce,
    //     params.bidder,
    //     params.bidAmount,
    //     params.domaintokenId,
    //     params.minbid,
    //     params.startblock,
    //     params.expireblock,
    //     config.wildTokenAddress,
    //     {
    //       gasLimit: 1000000,
    //     }
    //   );
    // console.log(tx.hash);
    // const receipt = await tx.wait(1);
    // console.log(receipt);
  });
  it("Accepts a v2.1 bid through the SDK", async () => {
    const p: Bid = {
      signedMessage:
        "0x032fdd066f7ad42b83a5dd96fde08f827b9e5d319289eb70f64a4b68531702e27d84a190b4eb6ab4715fcfea0bbd3b851d80f14865a53f1d5bc90f3ef8802f0c1c",
      bidNonce: "12742162097",
      bidder: mainAccount,
      amount: "98778900000000000000",
      tokenId: wilderPancakesDomain, // owner of this domain is now astro
      startBlock: "0",
      expireBlock: "99999999999",
      timestamp: "1652137472159",
      version: "2.0",
      contract: registrarAddress,
      bidToken: config.wildTokenAddress,
    };
    // Successful tx hash
    // 0xcca94eb464717878aea5b006cd84bf3b0a0d0e4de5c16c0bba787dba3bc5d519
    // const tx = await sdk.acceptBid(p, astroWallet);
    // console.log(tx.hash)
    // const receipt = await tx.wait(1)
    // console.log(receipt);
  });
  it("Sets a buy now price", async () => {
    const params: BuyNowParams = {
      amount: ethers.utils.parseEther("0.000005").toString(),
      tokenId: wilderPancakesDomain,
    };
    // Successful tx hash
    // 0xf141dcad72dd56833c2d2ec2ff2dfc8ba5bb53db14d1a0db2766319e9fef55c8
    const tx = await sdk.setBuyNowPrice(params, mainWallet);
    console.log(tx.hash);
  });
});
