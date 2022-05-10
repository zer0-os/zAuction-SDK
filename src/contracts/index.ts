import { ethers } from "ethers";
import {
  IERC20,
  IERC20__factory,
  IERC721,
  IERC721__factory,
  IZNSHub,
  IZNSHub__factory,
  ZAuction,
  ZAuctionV1,
  ZAuctionV1__factory,
  ZAuction__factory,
} from "./types";

export const getZAuctionContract = async (
  web3Provider: ethers.providers.Provider | ethers.Signer,
  address: string
): Promise<ZAuction> => {
  const contract = ZAuction__factory.connect(address, web3Provider);
  return contract;
};

export const getZAuctionV1Contract = async (
  web3Provider: ethers.providers.Provider | ethers.Signer,
  address: string // to change on new deployment
): Promise<ZAuctionV1> => {
  const contract = ZAuctionV1__factory.connect(address, web3Provider);
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

export const getZnsHubContract = async (
  web3Provider: ethers.providers.Provider | ethers.Signer,
  address: string
): Promise<IZNSHub> => {
  const contract = IZNSHub__factory.connect(address, web3Provider);
  return contract;
};
