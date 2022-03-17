import { ethers } from "ethers";
import * as zAuction from "../src";

require("dotenv").config();

const main = async () => {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://eth-rinkeby.alchemyapi.io/v2/MnO3SuHlzuCydPWE1XhsYZM_pHZP8_ix"
  );

  const instance = zAuction.createInstance({
    web3Provider: provider,
    apiUri: "https://zauction-api-rinkeby.herokuapp.com/api",
    subgraphUri:
      "https://api.thegraph.com/subgraphs/name/zer0-os/zauction-rinkeby",
    zAuctionAddress: "0xb2416Aed6f5439Ffa0eCCAaa2b643f3D9828f86B",
    tokenContract: "0xa4F6C921f914ff7972D7C55c15f015419326e0Ca",
  });

  const user1signer = new ethers.Wallet(process.env.USER1KEY!, provider);
  const user2signer = new ethers.Wallet(process.env.USER2KEY!, provider);

  const bid = await instance.placeBid(
    {
      tokenId:
        "0x6e35a7ecbf6b6368bb8d42ee9b3dcfc8404857635036e60196931d4458c07622",
      bidAmount: ethers.utils.parseEther("1").toString(),
      startBlock: "0",
      expireBlock: "99999999999",
    },
    user1signer
  );

  const tx = await instance.acceptBid(bid, user2signer);
  console.log(tx);
  const res = await tx.wait();
  console.log(res);
};

main().catch(console.error);
