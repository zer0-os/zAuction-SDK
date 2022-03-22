import { ethers, Wallet } from "ethers";
import {
  getERC721Contract,
  getZAuctionContract,
  getZAuctionTradeToken,
} from "../src/contracts";
import * as dotenv from "dotenv";

dotenv.config();

import * as actions from "../src/actions";

describe("SDK test", () => {
  const registrarAddress = "0xa4F6C921f914ff7972D7C55c15f015419326e0Ca";
  const zAuctionAddress = "0xb2416Aed6f5439Ffa0eCCAaa2b643f3D9828f86B";

  // wilder.pancakes on Rinkeby
  const wilderPancakesDomain =
    "0x6e35a7ecbf6b6368bb8d42ee9b3dcfc8404857635036e60196931d4458c07622";

  const provider = new ethers.providers.JsonRpcProvider(
    process.env.INFURA_URL,
    4
  );
  it("gets buynow price with default provider not a signer", async () => {
    const defaultProvider = ethers.providers.getDefaultProvider("rinkeby");

    const defaultzAuction = await getZAuctionContract(
      defaultProvider,
      zAuctionAddress
    );

    // Can we get variable values without user needing to connect?
    const buyNowPrice = await defaultzAuction.priceInfo(wilderPancakesDomain);
    console.log(buyNowPrice.toString());
  });
  it("Calls buyNow", async () => {
    // owner is main 521db
    // setup buynow with astro test 7a53

    const erc721Config = {
      provider: provider,
      address: registrarAddress,
    };

    // Get contract (registrar)
    const nftContract = await getERC721Contract(
      erc721Config.provider,
      erc721Config.address
    );

    // Get seller, 521db
    const seller = await nftContract.ownerOf(wilderPancakesDomain);

    // Confirm seller has approved the transfer of this nft
    const isApproved = await actions.isZAuctionApprovedNftTransfer(
      seller,
      zAuctionAddress,
      nftContract
    );

    if (!isApproved)
      throw Error("Seller did not approve zAuction to transfer NFT");

    const pk = process.env.TESTNET_PRIVATE_KEY;
    if (!pk) throw Error("Must give private key");
    const signer = new Wallet(pk, provider);
    const buyer = await signer.getAddress();

    if (seller === buyer) throw Error("Cannot purchase your own domain");

    const erc20Token = await getZAuctionTradeToken(
      // does zauction have an erc20??
      provider,
      zAuctionAddress
    );

    const allowance = await actions.getZAuctionTradeTokenAllowance(
      buyer,
      zAuctionAddress,
      erc20Token
    );

    const params = {
      amount: "15000000000000000000",
      tokenId: wilderPancakesDomain,
    };
    // Ensure buyer has approved zAuction to transfer tokens on their behalf
    if (allowance.lt(ethers.BigNumber.from(params.amount)))
      throw Error("zAuction is not approved to transfer this many tokens");

    const zAuction = await getZAuctionContract(signer, zAuctionAddress);

    const holder = (await zAuction.priceInfo(wilderPancakesDomain)).holder;
    if (holder !== seller) throw Error("Cannot sell a domain that isn't yours");

    const price = (await zAuction.priceInfo(wilderPancakesDomain)).price;
    if (price.eq("0")) throw Error("Domain is not for sale");
    if (price.toString() !== params.amount) throw Error("Wrong buynow price");

    try {
      const tx = await zAuction
        .connect(signer)
        .buyNow(params.amount, params.tokenId, { gasLimit: 1111501 });
      const receipt = await tx.wait(1);
      console.log(receipt);
    } catch (e) {
      console.log(e);
    }
  });
});
