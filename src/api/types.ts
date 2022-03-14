export interface BidParamsDto {
  nftId: string;
  account: string;
  uniqueBidId: string;
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

export interface BidParameters {
  bidder: string;
  contract: string;
  tokenId: string;
  amount: string;
  startBlock: string;
  expireBlock: string;
}

export interface BidMessage extends BidParameters {
  uniqueBidId: string;
}

export interface SignableBid {
  bid: BidMessage;
  message: string;
}

export interface SignedBid {
  bid: BidMessage;
  signedMessage: string;
}

export interface Bid extends BidMessage {
  signedMessage: string;
  timestamp: string;
}
