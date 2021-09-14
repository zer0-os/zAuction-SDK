export interface BidParamsDto {
  nftId: string;
  account: string;
  auctionId: string;
  bidAmount: string;
  minimumBid: string;
  contractAddress: string;
  startBlock: string;
  expireBlock: string;
  tokenId: string;
}

export interface BidDto extends BidParamsDto {
  date: number;
  signedMessage: string;
}
