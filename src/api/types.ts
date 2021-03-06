export interface BidParamsDto {
  account: string;
  bidNonce: string;
  bidAmount: string;
  minimumBid: string;
  contractAddress: string;
  startBlock: string;
  expireBlock: string;
  tokenId: string;
  bidToken?: string;
}

export interface BidDto extends BidParamsDto {
  date: number;
  signedMessage: string;
  version: "1.0" | "2.0";
}

export interface BidParameters {
  bidder: string;
  contract: string;
  tokenId: string;
  amount: string;
  startBlock: string;
  expireBlock: string;
  bidToken: string;
}

export interface BidMessage extends BidParameters {
  bidNonce: string;
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
  version: "1.0" | "2.0";
}
