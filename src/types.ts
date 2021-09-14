export interface TokenSale {
  contract: string;
  tokenId: string;
  saleAmount: string;
  buyer: string;
  seller: string;
  timestamp: string;
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
  auctionId: string;
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

export interface TokenBidCollection {
  [tokenId: string]: Bid[];
}
