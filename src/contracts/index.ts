import { ethers } from "ethers";
import {
  IERC20,
  IERC20__factory,
  IERC721,
  IERC721__factory,
  ZAuction,
  ZAuction__factory,
} from "./types";

export const getZAuctionContract = async (
  web3Provider: ethers.providers.Provider | ethers.Signer,
  address: string // to change on new deployment
): Promise<ZAuction> => {
  const contract = ZAuction__factory.connect(address, web3Provider);
  return contract;
};

export const getERC20Contract = async (
  web3Provider: ethers.providers.Provider | ethers.Signer,
  address: string
): Promise<IERC20> => {
  const contract = IERC20__factory.connect(address, web3Provider);
  return contract;
};

export const getERC721Contract = async (
  web3Provider: ethers.providers.Provider | ethers.Signer,
  address: string
): Promise<IERC721> => {
  const contract = IERC721__factory.connect(address, web3Provider);
  return contract;
};

export const getZAuctionTradeToken = async (
  web3Provider: ethers.providers.Provider | ethers.Signer,
  zAuctionAddress: string
): Promise<IERC20> => {
  const zAuction = await getZAuctionContract(web3Provider, zAuctionAddress);
  const tokenAddress = await zAuction.token();

  const tokenContract = await getERC20Contract(web3Provider, tokenAddress);

  return tokenContract;
};
